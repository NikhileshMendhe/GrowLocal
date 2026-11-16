import { withTransaction } from '../../db/pool.js';
import * as repository from './orders.repository.js';
import { createActivity } from '../customer-activities/activities.repository.js';
import { AppError, NotFoundError, ForbiddenError, ConflictError } from '../../errors/AppError.js';
import { assertOwnsOrder } from '../../middleware/ownership.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { shopRoom, customerRoom } from '../../realtime/rooms.js';
import * as notificationsService from '../notifications/notifications.service.js';
import { sendOrderNotificationEmail } from '../../utils/mailer.js';
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

  // Normalize line items
  let lineItems = [];
  if (Array.isArray(input.items) && input.items.length > 0) {
    lineItems = input.items.map((i) => ({
      productId: i.productId,
      productVariantId: i.productVariantId || null,
      quantity: Math.max(1, Number(i.quantity) || 1),
      unitPrice: i.unitPrice !== undefined && i.unitPrice !== null ? Number(i.unitPrice) : null,
      productName: i.productName || null,
      productImage: i.productImage || null,
    }));
  } else if (input.productId) {
    lineItems = [
      {
        productId: input.productId,
        productVariantId: input.productVariantId || null,
        quantity: Math.max(1, Number(input.quantity) || 1),
        unitPrice: input.unitPrice !== undefined && input.unitPrice !== null ? Number(input.unitPrice) : null,
        productName: input.productName || null,
        productImage: input.productImage || null,
      },
    ];
  } else {
    throw new AppError('No items specified for this order', 422, 'EMPTY_ORDER');
  }

  const fulfillmentType = input.fulfillmentType || 'delivery';
  const deliveryAddress = fulfillmentType === 'delivery' ? (input.deliveryAddress || '').trim() : null;
  if (fulfillmentType === 'delivery' && (!deliveryAddress || deliveryAddress.length < 5)) {
    throw new AppError('A valid delivery address (at least 5 characters) is required for delivery orders', 422, 'MISSING_DELIVERY_ADDRESS');
  }

  const inserted = await withTransaction(async (client) => {
    return insertMultiItemOrderInTx(client, {
      customerId,
      lineItems,
      fulfillmentType,
      deliveryAddress,
      recipientName: input.recipientName || null,
      recipientPhone: input.recipientPhone || null,
      deliveryPincode: input.deliveryPincode || null,
      deliveryNotes: input.deliveryNotes || null,
      origin: lineItems.length > 1 ? 'cart' : (input.origin || 'direct'),
    });
  });

  const order = await repository.findById(inserted.id);

  // Best-effort customer activity logging
  try {
    const primaryItem = (order.items && order.items[0]) || null;
    await createActivity({
      customerId,
      customerName: order.customer_name || input.recipientName || null,
      customerEmail: order.customer_email || null,
      customerPhone: order.customer_phone || input.recipientPhone || null,
      activityType: 'order_placed',
      productId: primaryItem ? primaryItem.product_id : order.product_id,
      productName: primaryItem ? primaryItem.product_name : order.product_name,
      productPrice: Number(order.total_amount),
      quantity: order.quantity,
      metadata: {
        orderId: order.id,
        orderCode: order.order_code,
        itemCount: order.items ? order.items.length : 1,
        totalAmount: Number(order.total_amount),
        fulfillmentType: order.fulfillment_type,
      },
      status: 'completed',
    });
  } catch (actErr) {
    logger.warn({ err: actErr }, 'Failed to record customer order activity');
  }

  // Socket broadcast to admin, catalog, and customer
  emitToRooms([...orderRooms(order), 'admin:global', 'catalog'], EVENTS.ORDER_CREATED, order);

  await notify({
    recipientType: 'admin',
    recipientId: null,
    type: 'order_created',
    title: 'New order received',
    message: `New order ${order.order_code} (${order.quantity} item${order.quantity > 1 ? 's' : ''} - ₹${order.total_amount})`,
    referenceType: 'order',
    referenceId: order.id,
  });

  sendOrderNotificationEmail(order).catch((err) =>
    logger.warn({ err }, 'Failed to dispatch order notification email')
  );

  return order;
}

/**
 * Multi-item order creation path. Atomically locks products, validates stock,
 * decrements stock, inserts order + order_items + deliveries + order_status_history.
 */
export async function insertMultiItemOrderInTx(
  client,
  {
    customerId,
    lineItems,
    fulfillmentType,
    deliveryAddress,
    recipientName,
    recipientPhone,
    deliveryPincode,
    deliveryNotes,
    origin = 'direct',
  }
) {
  let totalQuantity = 0;
  let totalAmount = 0;
  let firstShopId = null;
  let firstMerchantId = null;
  const processedItems = [];

  for (const item of lineItems) {
    const product = await repository.lockProductForOrder(client, item.productId);
    if (!product) throw new NotFoundError(`Product not found (ID: ${item.productId})`);
    if (product.approval_status !== 'approved') {
      throw new ConflictError(`Product "${product.name}" is not available for ordering`);
    }

    if (!firstShopId) firstShopId = product.shop_id || null;
    if (!firstMerchantId) firstMerchantId = product.merchant_id || null;

    let unitPrice = item.unitPrice ?? Number(product.price);
    if (item.productVariantId) {
      const variant = await repository.lockVariantForOrder(client, item.productId, item.productVariantId);
      if (!variant) throw new NotFoundError('Product variant not found');
      if (!variant.is_available) throw new ConflictError('This product variant is not available');
      if (variant.stock_quantity < item.quantity) {
        throw new ConflictError(`Insufficient stock for variant of "${product.name}" (only ${variant.stock_quantity} left)`);
      }
      if (item.unitPrice === null && variant.price !== null) unitPrice = Number(variant.price);
      await repository.adjustVariantStock(client, item.productVariantId, -item.quantity);
    } else {
      if (product.stock_quantity < item.quantity) {
        throw new ConflictError(`Insufficient stock for "${product.name}" (only ${product.stock_quantity} available)`);
      }
      await repository.adjustProductStock(client, item.productId, -item.quantity);

      // If stock reached 0, update availability_status
      if (product.stock_quantity - item.quantity <= 0) {
        await client.query(
          "UPDATE products SET availability_status = 'Out of Stock' WHERE id = $1",
          [item.productId]
        );
      }
    }

    const itemTotal = unitPrice * item.quantity;
    totalQuantity += item.quantity;
    totalAmount += itemTotal;

    processedItems.push({
      productId: item.productId,
      productVariantId: item.productVariantId || null,
      productName: item.productName || product.name,
      productImage: item.productImage || product.image_url || null,
      unitPrice,
      quantity: item.quantity,
      totalPrice: itemTotal,
    });
  }

  const singleProductId = processedItems.length === 1 ? processedItems[0].productId : null;
  const singleVariantId = processedItems.length === 1 ? processedItems[0].productVariantId : null;
  const avgUnitPrice = processedItems.length === 1 ? processedItems[0].unitPrice : totalAmount / (totalQuantity || 1);

  const order = await repository.insertOrder(client, {
    customerId,
    shopId: firstShopId,
    merchantId: firstMerchantId,
    productId: singleProductId,
    productVariantId: singleVariantId,
    origin,
    quantity: totalQuantity,
    unitPrice: avgUnitPrice,
    totalAmount,
    fulfillmentType,
    deliveryAddress,
  });

  // Insert line items
  await repository.insertOrderItems(client, order.id, processedItems);

  // Insert delivery record
  if (fulfillmentType === 'delivery') {
    await repository.insertDelivery(client, {
      orderId: order.id,
      deliveryStatus: 'pending',
      deliveryAddress,
      deliveryPincode,
      recipientName,
      recipientPhone,
      deliveryNotes,
    });
  }

  // Insert initial order status history
  await repository.insertStatusHistory(client, {
    orderId: order.id,
    oldStatus: null,
    newStatus: 'pending',
    changedByType: 'customer',
    changedById: customerId,
    notes: 'Order placed by customer via storefront checkout',
  });

  return order;
}

/**
 * Single-product order insertion helper (retained for backward compatibility e.g. offers).
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
  return insertMultiItemOrderInTx(client, {
    customerId,
    lineItems: [
      {
        productId,
        productVariantId,
        quantity,
        unitPrice: unitPriceOverride,
      },
    ],
    fulfillmentType,
    deliveryAddress,
    origin: origin || 'direct',
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
