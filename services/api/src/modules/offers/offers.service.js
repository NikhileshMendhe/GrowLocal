import { withTransaction } from '../../db/pool.js';
import * as repository from './offers.repository.js';
import { insertOrderInTx } from '../orders/orders.service.js';
import { findById as findOrderById } from '../orders/orders.repository.js';
import { AppError, NotFoundError, ForbiddenError, ConflictError } from '../../errors/AppError.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { shopRoom, customerRoom } from '../../realtime/rooms.js';
import * as notificationsService from '../notifications/notifications.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Offer business rules (§6.6): merchant responds to an enquiry, customer
 * accepts (which creates the order, reusing orders.service create logic)
 * or rejects.
 */

const DEFAULT_OFFER_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OPEN_ENQUIRY_STATUSES = ['pending', 'responded', 'offer_sent'];

/** Best-effort notification side-effect — never fails the commerce write (§7.5). */
async function notify(input) {
  try {
    await notificationsService.create(input);
  } catch (error) {
    logger.warn({ err: error }, 'notification side-effect failed');
  }
}

function offerRooms(shopId, customerId) {
  return [shopRoom(shopId), customerRoom(customerId)];
}

export async function create(merchantId, input) {
  const enquiry = await repository.findEnquiryWithShop(input.enquiryId);
  if (!enquiry) throw new NotFoundError('Enquiry not found');
  if (enquiry.shop_merchant_id !== merchantId) {
    throw new ForbiddenError('This enquiry is not for your shop');
  }
  if (!OPEN_ENQUIRY_STATUSES.includes(enquiry.status)) {
    throw new ConflictError('This enquiry is no longer open');
  }
  if (!enquiry.product_id) {
    throw new AppError('This enquiry has no product to make an offer on', 422, 'NO_PRODUCT');
  }
  const expiresAt = input.expiresAt ?? new Date(Date.now() + DEFAULT_OFFER_TTL_MS);
  if (expiresAt.getTime() <= Date.now()) {
    throw new AppError('expiresAt must be in the future', 422, 'INVALID_EXPIRY');
  }

  const inserted = await withTransaction(async (client) => {
    const created = await repository.insert(client, {
      enquiryId: enquiry.id,
      merchantId,
      shopId: enquiry.shop_id,
      productId: enquiry.product_id,
      price: input.price,
      originalPrice: input.originalPrice,
      discount: input.discount,
      message: input.message,
      expiresAt,
    });
    const updated = await repository.setEnquiryStatusGuarded(
      client,
      enquiry.id,
      enquiry.status,
      'offer_sent'
    );
    if (!updated) throw new ConflictError('Enquiry was modified concurrently; reload and retry');
    return created;
  });
  const offer = await repository.findById(inserted.id);
  const updatedEnquiry = await repository.findEnquiryWithShop(enquiry.id);
  emitToRooms(offerRooms(offer.shop_id, enquiry.customer_id), EVENTS.OFFER_CREATED, offer);
  await notify({
    recipientType: 'customer',
    recipientId: enquiry.customer_id,
    type: 'offer_created',
    title: 'New offer',
    message: `The shop made you an offer of ₹${offer.price} on ${offer.product_name}`,
    referenceType: 'offer',
    referenceId: offer.id,
  });
  return { offer, enquiry: updatedEnquiry };
}

export async function getOffer(id, auth) {
  const offer = await repository.findById(id);
  if (!offer) throw new NotFoundError('Offer not found');
  const isParticipant =
    (auth.type === 'customer' && offer.customer_id === auth.id) ||
    (auth.type === 'merchant' && offer.merchant_id === auth.id);
  if (!isParticipant) throw new ForbiddenError('You are not a participant in this offer');
  return offer;
}

export async function list(auth, options) {
  if (auth.type === 'customer') return repository.listForCustomer(auth.id, options);
  return repository.listForMerchant(auth.id, options);
}

/**
 * §6.6 accept — ONE transaction: validate the offer is active and the
 * enquiry open, create the order (stock check + decrement), then flip the
 * offer/enquiry statuses. Any failure rolls the whole thing back.
 */
export async function acceptOffer(
  customerId,
  offerId,
  { productId, quantity = 1, fulfillmentType = 'pickup', deliveryAddress } = {}
) {
  const result = await withTransaction(async (client) => {
    const offer = await repository.lockById(client, offerId);
    if (!offer) throw new NotFoundError('Offer not found');
    if (offer.status !== 'sent') {
      throw new ConflictError(`This offer is no longer active (status: ${offer.status})`);
    }
    if (offer.expires_at && new Date(offer.expires_at).getTime() <= Date.now()) {
      throw new ConflictError('This offer has expired');
    }
    const enquiry = offer.enquiry_id
      ? await repository.lockEnquiry(client, offer.enquiry_id)
      : null;
    if (!enquiry) throw new ConflictError('This offer is no longer linked to an open enquiry');
    if (enquiry.customer_id !== customerId) {
      throw new ForbiddenError('This offer is not yours to accept');
    }
    if (!OPEN_ENQUIRY_STATUSES.includes(enquiry.status)) {
      throw new ConflictError('The linked enquiry is no longer open');
    }
    if (productId && productId !== offer.product_id) {
      throw new AppError('productId does not match the offer product', 422, 'PRODUCT_MISMATCH');
    }

    const order = await insertOrderInTx(client, {
      customerId,
      productId: offer.product_id,
      quantity,
      fulfillmentType,
      deliveryAddress,
      origin: 'offer_accepted',
      enquiryId: enquiry.id,
      offerId: offer.id,
      unitPriceOverride: offer.price,
    });
    const acceptedOffer = await repository.setStatusGuarded(client, offer.id, 'sent', 'accepted');
    if (!acceptedOffer) throw new ConflictError('Offer was modified concurrently; reload and retry');
    const updatedEnquiry = await repository.setEnquiryStatusGuarded(
      client,
      enquiry.id,
      enquiry.status,
      'accepted'
    );
    if (!updatedEnquiry) {
      throw new ConflictError('Enquiry was modified concurrently; reload and retry');
    }
    return { orderId: order.id, offer: acceptedOffer, enquiry: updatedEnquiry };
  });

  const order = await findOrderById(result.orderId);
  const rooms = offerRooms(order.shop_id, customerId);
  emitToRooms(rooms, EVENTS.ORDER_CREATED, order);
  emitToRooms(rooms, EVENTS.OFFER_STATUS_CHANGED, result.offer);
  emitToRooms(rooms, EVENTS.ENQUIRY_STATUS_CHANGED, result.enquiry);
  await notify({
    recipientType: 'merchant',
    recipientId: order.merchant_id,
    type: 'offer_accepted',
    title: 'Offer accepted',
    message: `Your offer on ${order.product_name} was accepted (order ${order.order_code})`,
    referenceType: 'offer',
    referenceId: result.offer.id,
  });
  return { order, offer: result.offer, enquiry: result.enquiry };
}

export async function rejectOffer(customerId, offerId) {
  const result = await withTransaction(async (client) => {
    const offer = await repository.lockById(client, offerId);
    if (!offer) throw new NotFoundError('Offer not found');
    if (offer.status !== 'sent') {
      throw new ConflictError(`This offer is no longer active (status: ${offer.status})`);
    }
    if (offer.expires_at && new Date(offer.expires_at).getTime() <= Date.now()) {
      throw new ConflictError('This offer has expired');
    }
    const enquiry = offer.enquiry_id
      ? await repository.lockEnquiry(client, offer.enquiry_id)
      : null;
    if (!enquiry) throw new ConflictError('This offer is no longer linked to an open enquiry');
    if (enquiry.customer_id !== customerId) {
      throw new ForbiddenError('This offer is not yours to reject');
    }
    if (!OPEN_ENQUIRY_STATUSES.includes(enquiry.status)) {
      throw new ConflictError('The linked enquiry is no longer open');
    }
    const rejected = await repository.setStatusGuarded(client, offer.id, 'sent', 'rejected');
    if (!rejected) throw new ConflictError('Offer was modified concurrently; reload and retry');
    const updatedEnquiry = await repository.setEnquiryStatusGuarded(
      client,
      enquiry.id,
      enquiry.status,
      'responded'
    );
    if (!updatedEnquiry) {
      throw new ConflictError('Enquiry was modified concurrently; reload and retry');
    }
    return { offer: rejected, enquiry: updatedEnquiry };
  });

  const offer = await repository.findById(offerId);
  const rooms = offerRooms(offer.shop_id, customerId);
  emitToRooms(rooms, EVENTS.OFFER_STATUS_CHANGED, result.offer);
  emitToRooms(rooms, EVENTS.ENQUIRY_STATUS_CHANGED, result.enquiry);
  await notify({
    recipientType: 'merchant',
    recipientId: offer.merchant_id,
    type: 'offer_rejected',
    title: 'Offer rejected',
    message: 'The customer rejected your offer',
    referenceType: 'offer',
    referenceId: offer.id,
  });
  return { offer, enquiry: result.enquiry };
}
