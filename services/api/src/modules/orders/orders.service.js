import { withTransaction } from '../../db/pool.js';
import * as repository from './orders.repository.js';
import { AppError, NotFoundError, ForbiddenError, ConflictError } from '../../errors/AppError.js';
import { assertOwnsOrder } from '../../middleware/ownership.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { shopRoom, customerRoom } from '../../realtime/rooms.js';
import * as notificationsService from '../notifications/notifications.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Order state machine (§6.5, statuses per §3.2 orders.status CHECK).
 * cancelled_by_customer is reachable only via the cancel endpoint, expired
 * only via the expiry job — hence absent from the merchant's allowed set.
 */
const MERCHANT_TRANSITIONS = {
  pending_confirmation: ['confirmed', 'rejected_by_merchant'],
  confirmed: ['ready_for_pickup', 'out_for_delivery', 'completed'],
  ready_for_pickup: ['completed'],
  out_for_delivery: ['completed'],
  completed: [],
  rejected_by_merchant: [],
  cancelled_by_customer: [],
  expired: [],
};

function invalidTransition(from, to) {
  return new AppError(`Cannot change order status from '${from}' to '${to}'`, 422, 'INVALID_TRANSITION', {
    from,
    to,
  });
}

function orderRooms(order) {
  return [shopRoom(order.shop_id), customerRoom(order.customer_id)];
}

/** Best-effort notification side-effect — never fails the commerce write (§7.5). */
async function notify(input) {
  try {
    await notificationsService.create(input);
  } catch (error) {
    logger.warn({ err: error }, 'notification side-effect failed');
  }
}

export async function createOrder(customerId, input) {
  if (input.offerId) {
    // §6.5 offerId — the accept flow owns offer validation and status side effects
    const { acceptOffer } = await import('../offers/offers.service.js');
    const { order } = await acceptOffer(customerId, input.offerId, input);
    return order;
  }
  const inserted = await withTransaction((client) =>
    insertOrderInTx(client, {
      customerId,
      productId: input.productId,
      productVariantId: input.productVariantId,
      quantity: input.quantity,
      fulfillmentType: input.fulfillmentType,
      deliveryAddress: input.deliveryAddress,
      origin: 'direct',
    })
  );
  const order = await repository.findById(inserted.id);
  emitToRooms(orderRooms(order), EVENTS.ORDER_CREATED, order);
  await notify({
    recipientType: 'merchant',
    recipientId: order.merchant_id,
    type: 'order_created',
    title: 'New order received',
    message: `New order ${order.order_code} (${order.quantity} × ${order.product_name})`,
    referenceType: 'order',
    referenceId: order.id,
  });
  return order;
}

/**
 * The one order-creation path (§7.2): locks the product row FOR UPDATE,
 * verifies stock, decrements it, and inserts the orders row with a
 * server-computed price snapshot — on the caller's transaction so
 * offer-acceptance shares it (§6.6).
 */
export async function insertOrderInTx(
  client,
  {
    customerId,
    productId,
    productVariantId,
    quantity,
    fulfillmentType,
    deliveryAddress,
    origin,
    enquiryId,
    offerId,
    unitPriceOverride,
  }
) {
  if (fulfillmentType === 'delivery' && !deliveryAddress) {
    throw new AppError('deliveryAddress is required for delivery orders', 422, 'MISSING_DELIVERY_ADDRESS');
  }
  const product = await repository.lockProductForOrder(client, productId);
  if (!product) throw new NotFoundError('Product not found');
  if (product.approval_status !== 'approved') {
    throw new ConflictError('This product is not available for ordering');
  }

  let unitPrice = unitPriceOverride ?? product.price;
  if (productVariantId) {
    const variant = await repository.lockVariantForOrder(client, productId, productVariantId);
    if (!variant) throw new NotFoundError('Product variant not found');
    if (!variant.is_available) throw new ConflictError('This product variant is not available');
    if (variant.stock_quantity < quantity) {
      throw new ConflictError(`Insufficient stock: ${variant.stock_quantity} left for this variant`);
    }
    if (unitPriceOverride === undefined && variant.price !== null) unitPrice = variant.price;
    await repository.adjustVariantStock(client, productVariantId, -quantity);
  } else {
    if (product.stock_quantity < quantity) {
      throw new ConflictError(`Insufficient stock: ${product.stock_quantity} left`);
    }
    await repository.adjustProductStock(client, productId, -quantity);
  }

  return repository.insertOrder(client, {
    customerId,
    shopId: product.shop_id,
    merchantId: product.merchant_id,
    productId,
    productVariantId,
    enquiryId,
    offerId,
    origin,
    quantity,
    unitPrice,
    totalAmount: unitPrice * quantity,
    fulfillmentType,
    deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : null,
  });
}

export async function getOrder(id, auth) {
  const order = await repository.findById(id);
  if (!order) throw new NotFoundError('Order not found');
  assertOwnsOrder(order, auth);
  return order;
}

export async function listMine(customerId, options) {
  return repository.listByCustomer(customerId, options);
}

export async function listForMerchant(merchantId, options) {
  return repository.listByMerchant(merchantId, options);
}

export async function updateStatus(orderId, merchantId, nextStatus) {
  const order = await repository.findById(orderId);
  if (!order) throw new NotFoundError('Order not found');
  if (order.merchant_id !== merchantId) {
    throw new ForbiddenError('This order does not belong to your shop');
  }
  const allowed = MERCHANT_TRANSITIONS[order.status] || [];
  if (!allowed.includes(nextStatus)) throw invalidTransition(order.status, nextStatus);

  await withTransaction(async (client) => {
    const updated = await repository.updateStatusGuarded(client, orderId, order.status, nextStatus);
    if (!updated) throw new ConflictError('Order was modified concurrently; reload and retry');
    if (nextStatus === 'rejected_by_merchant') await restoreStock(client, updated);
  });
  const full = await repository.findById(orderId);
  emitToRooms(orderRooms(full), EVENTS.ORDER_STATUS_CHANGED, { ...full, previous_status: order.status });
  if (nextStatus === 'rejected_by_merchant') {
    await notify({
      recipientType: 'customer',
      recipientId: full.customer_id,
      type: 'order_rejected',
      title: 'Order rejected',
      message: `Your order ${full.order_code} was rejected by the shop`,
      referenceType: 'order',
      referenceId: full.id,
    });
  }
  return full;
}

/** §6.5 cancel — customer, only while pending_confirmation; stock restored in the same transaction. */
export async function cancelOrder(orderId, customerId) {
  const order = await repository.findById(orderId);
  if (!order) throw new NotFoundError('Order not found');
  if (order.customer_id !== customerId) throw new ForbiddenError('You do not own this order');
  if (order.status !== 'pending_confirmation') {
    throw invalidTransition(order.status, 'cancelled_by_customer');
  }
  await withTransaction(async (client) => {
    const updated = await repository.updateStatusGuarded(
      client,
      orderId,
      'pending_confirmation',
      'cancelled_by_customer'
    );
    if (!updated) throw new ConflictError('Order was modified concurrently; reload and retry');
    await restoreStock(client, updated);
  });
  const full = await repository.findById(orderId);
  emitToRooms(orderRooms(full), EVENTS.ORDER_STATUS_CHANGED, { ...full, previous_status: order.status });
  await notify({
    recipientType: 'merchant',
    recipientId: full.merchant_id,
    type: 'order_cancelled',
    title: 'Order cancelled',
    message: `Order ${full.order_code} was cancelled by the customer`,
    referenceType: 'order',
    referenceId: full.id,
  });
  return full;
}

async function restoreStock(client, order) {
  if (order.product_variant_id) {
    await repository.adjustVariantStock(client, order.product_variant_id, order.quantity);
  } else {
    await repository.adjustProductStock(client, order.product_id, order.quantity);
  }
}
