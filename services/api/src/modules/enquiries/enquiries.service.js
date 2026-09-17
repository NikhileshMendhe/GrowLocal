import * as repository from './enquiries.repository.js';
import { AppError, NotFoundError, ForbiddenError, ConflictError } from '../../errors/AppError.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { shopRoom, customerRoom, merchantRoom } from '../../realtime/rooms.js';
import * as notificationsService from '../notifications/notifications.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Enquiry state machine (§6.6; statuses per §3.2 enquiries.status CHECK).
 * accepted/expired are set by the offer flow and the expiry job (§7.6) —
 * never via PATCH — and terminal states accept no further transitions.
 */
const PATCH_TRANSITIONS = {
  pending: { merchant: ['responded', 'declined'], customer: ['declined'] },
  responded: { merchant: ['declined'], customer: ['declined'] },
  offer_sent: { merchant: ['declined'], customer: ['declined'] },
  accepted: {},
  declined: {},
  expired: {},
};

function invalidTransition(from, to) {
  return new AppError(`Cannot change enquiry status from '${from}' to '${to}'`, 422, 'INVALID_TRANSITION', {
    from,
    to,
  });
}

function enquiryRooms(enquiry) {
  return [customerRoom(enquiry.customer_id), shopRoom(enquiry.shop_id)];
}

/** Best-effort notification side-effect — never fails the commerce write (§7.5). */
async function notify(input) {
  try {
    await notificationsService.create(input);
  } catch (error) {
    logger.warn({ err: error }, 'notification side-effect failed');
  }
}

export async function create(customerId, input) {
  const shop = await repository.findShop(input.shopId);
  if (!shop) throw new NotFoundError('Shop not found');
  if (input.productId) {
    const product = await repository.findProduct(input.productId);
    if (!product) throw new NotFoundError('Product not found');
    if (product.shop_id !== shop.id) {
      throw new AppError('Product does not belong to this shop', 422, 'PRODUCT_SHOP_MISMATCH');
    }
  }
  const inserted = await repository.insertEnquiry({ customerId, ...input });
  const enquiry = await repository.findById(inserted.id);
  emitToRooms([shopRoom(shop.id), merchantRoom(shop.merchant_id)], EVENTS.ENQUIRY_CREATED, enquiry);
  await notify({
    recipientType: 'merchant',
    recipientId: shop.merchant_id,
    type: 'enquiry_created',
    title: 'New enquiry',
    message: `New enquiry on ${shop.name}`,
    referenceType: 'enquiry',
    referenceId: enquiry.id,
  });
  return enquiry;
}

export async function listMine(customerId, options) {
  return repository.listByCustomer(customerId, options);
}

export async function listForMerchant(merchantId, options) {
  return repository.listByShopMerchant(merchantId, options);
}

export async function updateStatus(id, auth, nextStatus) {
  const enquiry = await repository.findById(id);
  if (!enquiry) throw new NotFoundError('Enquiry not found');
  const isCustomer = auth.type === 'customer' && enquiry.customer_id === auth.id;
  const isMerchant = auth.type === 'merchant' && enquiry.merchant_id === auth.id;
  if (!isCustomer && !isMerchant) throw new ForbiddenError('You are not a participant in this enquiry');
  const allowed = PATCH_TRANSITIONS[enquiry.status]?.[auth.type] || [];
  if (!allowed.includes(nextStatus)) throw invalidTransition(enquiry.status, nextStatus);

  const updated = await repository.updateStatusGuarded(id, enquiry.status, nextStatus);
  if (!updated) throw new ConflictError('Enquiry was modified concurrently; reload and retry');
  const full = await repository.findById(id);
  emitToRooms(enquiryRooms(full), EVENTS.ENQUIRY_STATUS_CHANGED, {
    ...full,
    previous_status: enquiry.status,
  });
  await notify({
    recipientType: isCustomer ? 'merchant' : 'customer',
    recipientId: isCustomer ? full.merchant_id : full.customer_id,
    type: 'enquiry_status_changed',
    title: 'Enquiry updated',
    message: `Enquiry ${full.enquiry_code} is now ${nextStatus}`,
    referenceType: 'enquiry',
    referenceId: full.id,
  });
  return full;
}
