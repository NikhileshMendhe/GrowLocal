import * as repository from './enquiries.repository.js';
import { query } from '../../db/pool.js';
import { createActivity } from '../customer-activities/activities.repository.js';
import { AppError, NotFoundError, ForbiddenError, ConflictError } from '../../errors/AppError.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { shopRoom, customerRoom, merchantRoom } from '../../realtime/rooms.js';
import * as notificationsService from '../notifications/notifications.service.js';
import { sendInquiryNotificationEmail } from '../../utils/mailer.js';
import { logger } from '../../utils/logger.js';

/**
 * Enquiry state machine (§6.6; statuses per §3.2 enquiries.status CHECK).
 * accepted/expired are set by the offer flow and the expiry job (§7.6) —
 * never via PATCH — and terminal states accept no further transitions.
 */
const PATCH_TRANSITIONS = {
  pending: { merchant: ['responded', 'declined'], customer: ['declined'], admin: ['responded', 'declined', 'accepted'] },
  responded: { merchant: ['declined'], customer: ['declined'], admin: ['declined', 'accepted'] },
  offer_sent: { merchant: ['declined'], customer: ['declined'], admin: ['declined', 'accepted'] },
  accepted: { admin: ['declined'] },
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

export async function logWhatsAppInquiry(authCustomerId, input) {
  const customerId = authCustomerId || input.customerId || null;
  let shopId = null;
  let productId = input.productId || null;

  if (productId) {
    const product = await repository.findProduct(productId);
    if (product) {
      shopId = product.shop_id || null;
    }
  }

  let msg = input.message || '';
  if (!msg) {
    if (input.items && Array.isArray(input.items) && input.items.length > 0) {
      const summary = input.items
        .map((i) => `${i.product?.name || 'Product'} (x${i.quantity || 1})`)
        .join(', ');
      msg = `Cart Inquiry (${input.items.length} items): ${summary}. Total: ₹${input.totalAmount || 0}`;
    } else if (input.productName) {
      msg = `WhatsApp Inquiry for ${input.productName} (Qty: ${input.quantity || 1})`;
    } else {
      msg = 'Customer initiated WhatsApp Inquiry';
    }
  }

  if (input.customerPhone) {
    msg += ` | Phone: ${input.customerPhone}`;
  }
  if (input.customerName) {
    msg += ` | Customer: ${input.customerName}`;
  }

  const budget = input.totalAmount
    ? String(input.totalAmount)
    : input.budget
    ? String(input.budget)
    : null;

  const inserted = await repository.insertEnquiry({
    customerId: customerId || null,
    shopId: shopId || null,
    productId: productId || null,
    requestedSize: input.requestedSize || null,
    requestedColor: input.requestedColor || null,
    budget: budget || null,
    message: msg,
  });

  const enquiry = await repository.findById(inserted.id);
  const payload = enquiry || inserted;

  let custName = input.customerName || null;
  let custEmail = input.customerEmail || null;
  let custPhone = input.customerPhone || null;

  if (customerId && (!custName || !custEmail)) {
    const { rows: custRows } = await query(
      'SELECT full_name, email, phone FROM customers WHERE id = $1',
      [customerId]
    ).catch(() => ({ rows: [] }));
    if (custRows[0]) {
      custName = custName || custRows[0].full_name;
      custEmail = custEmail || custRows[0].email;
      custPhone = custPhone || custRows[0].phone;
    }
  }

  // Also log to customer_activities for instant live tracking
  await createActivity({
    customerId: customerId || null,
    customerName: custName,
    customerEmail: custEmail,
    customerPhone: custPhone,
    activityType: 'whatsapp_inquiry_click',
    productId: productId || null,
    productName: input.productName || payload.product_name || null,
    productPrice: input.productPrice !== undefined ? Number(input.productPrice) : (payload.product_price ? Number(payload.product_price) : null),
    quantity: input.quantity || 1,
    metadata: {
      enquiryId: inserted.id,
      enquiryCode: inserted.enquiry_code,
      destination: 'https://wa.me/message/YYPIT2XYSY5WD1',
    },
    status: 'clicked',
  }).catch(() => null);

  emitToRooms(['admin:global', 'catalog'], EVENTS.ENQUIRY_CREATED, payload);

  await notify({
    recipientType: 'admin',
    recipientId: null,
    type: 'enquiry_created',
    title: 'New Customer Inquiry',
    message: `Customer inquired about ${payload.product_name || 'store products'} on WhatsApp`,
    referenceType: 'enquiry',
    referenceId: payload.id,
  });

  sendInquiryNotificationEmail(payload).catch((err) =>
    logger.warn({ err }, 'Failed to dispatch inquiry notification email')
  );

  return {
    ...payload,
    redirectUrl: 'https://wa.me/message/YYPIT2XYSY5WD1',
  };
}

export async function updateStatus(id, auth, nextStatus) {
  const enquiry = await repository.findById(id);
  if (!enquiry) throw new NotFoundError('Enquiry not found');
  const isAdmin = auth.type === 'admin';
  const isCustomer = auth.type === 'customer' && enquiry.customer_id === auth.id;
  const isMerchant = auth.type === 'merchant' && enquiry.merchant_id === auth.id;
  if (!isCustomer && !isMerchant && !isAdmin) throw new ForbiddenError('You are not a participant in this enquiry');
  const allowed = PATCH_TRANSITIONS[enquiry.status]?.[auth.type] || [];
  if (!allowed.includes(nextStatus)) throw invalidTransition(enquiry.status, nextStatus);

  const updated = await repository.updateStatusGuarded(id, enquiry.status, nextStatus);
  if (!updated) throw new ConflictError('Enquiry was modified concurrently; reload and retry');
  const full = await repository.findById(id);
  emitToRooms([...enquiryRooms(full), 'admin:global'], EVENTS.ENQUIRY_STATUS_CHANGED, {
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
