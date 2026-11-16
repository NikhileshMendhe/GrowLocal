import * as repository from './activities.repository.js';
import { query } from '../../db/pool.js';
import { emitToRooms } from '../../realtime/socket.js';

export async function logActivity(caller, input) {
  let customerId = input.customerId || null;
  let customerName = input.customerName || null;
  let customerEmail = input.customerEmail || null;
  let customerPhone = input.customerPhone || null;

  if (caller && caller.type === 'customer') {
    customerId = caller.id;
    if (!customerName || !customerEmail) {
      const { rows } = await query(
        'SELECT full_name, email, phone FROM customers WHERE id = $1',
        [caller.id]
      );
      if (rows[0]) {
        customerName = customerName || rows[0].full_name;
        customerEmail = customerEmail || rows[0].email;
        customerPhone = customerPhone || rows[0].phone;
      }
    }
  }

  let productName = input.productName || null;
  let productPrice = input.productPrice !== undefined ? input.productPrice : null;

  if (input.productId && (!productName || productPrice === null)) {
    const { rows } = await query(
      'SELECT name, price FROM products WHERE id = $1',
      [input.productId]
    );
    if (rows[0]) {
      productName = productName || rows[0].name;
      if (productPrice === null) productPrice = rows[0].price;
    }
  }

  const activity = await repository.createActivity({
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    activityType: input.activityType,
    productId: input.productId || null,
    productName,
    productPrice,
    quantity: input.quantity || 1,
    metadata: input.metadata || {},
    status: input.status || 'completed',
  });

  // Broadcast to admin room for instant live dashboard update
  emitToRooms(['admin:global'], 'activity:created', activity);

  return activity;
}

export async function listAdminActivities(options) {
  return repository.listActivities(options);
}
