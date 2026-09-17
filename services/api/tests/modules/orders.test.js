import test from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/growlocal_wb';

let app;
let EVENTS;
let custClient;
let cust2Client;
let merchClient;
let merch2Client;
let custToken;
let customerId;
let merchantId;
let shopId;
let widgetA;
let widgetB;
let widgetC;

async function insertShop(merchantId, name) {
  const { rows } = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city, status)
     VALUES ($1, $2, '12 Test Street', 'Nagpur', 'open') RETURNING id`,
    [merchantId, name]
  );
  return rows[0].id;
}

async function insertProduct(shopId, name, price, stock) {
  const { rows } = await app.pool.query(
    `INSERT INTO products (shop_id, name, price, stock_quantity, approval_status)
     VALUES ($1, $2, $3, $4, 'approved') RETURNING id`,
    [shopId, name, price, stock]
  );
  return rows[0].id;
}

async function stockOf(productId) {
  const { rows } = await app.pool.query('SELECT stock_quantity FROM products WHERE id = $1', [
    productId,
  ]);
  return rows[0].stock_quantity;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  ({ EVENTS } = await import('../../src/realtime/events.js'));
  await truncateAll();

  custClient = makeClient(app.baseUrl);
  const cust = await custClient.post('/auth/customer/signup', {
    fullName: 'Orders Customer',
    email: 'wb-orders-cust@test.local',
    password: 'Password123',
  });
  assert.equal(cust.status, 201);
  custClient.setToken(cust.data.accessToken);
  custToken = cust.data.accessToken;
  customerId = cust.data.user.id;

  cust2Client = makeClient(app.baseUrl);
  const cust2 = await cust2Client.post('/auth/customer/signup', {
    fullName: 'Orders Other',
    email: 'wb-orders-other@test.local',
    password: 'Password123',
  });
  cust2Client.setToken(cust2.data.accessToken);

  merchClient = makeClient(app.baseUrl);
  const merch = await merchClient.post('/auth/merchant/signup', {
    ownerName: 'Orders Owner',
    businessName: 'Orders Shop Pvt',
    email: 'wb-orders-merchant@test.local',
    password: 'Password123',
    phone: '9876543210',
  });
  merchClient.setToken(merch.data.accessToken);
  merchantId = merch.data.user.id;

  merch2Client = makeClient(app.baseUrl);
  const merch2 = await merch2Client.post('/auth/merchant/signup', {
    ownerName: 'Rival Owner',
    businessName: 'Rival Shop Pvt',
    email: 'wb-orders-rival@test.local',
    password: 'Password123',
    phone: '9876543211',
  });
  merch2Client.setToken(merch2.data.accessToken);

  shopId = await insertShop(merchantId, 'WB Orders Shop');
  widgetA = await insertProduct(shopId, 'Widget A', 250.5, 10);
  widgetB = await insertProduct(shopId, 'Widget B', 100, 2);
  widgetC = await insertProduct(shopId, 'Widget C', 400, 5);
});

test.after(async () => {
  await app.stop();
});

test('POST /orders requires authentication', async () => {
  const response = await makeClient(app.baseUrl).post('/orders', {
    productId: widgetA,
    quantity: 1,
    fulfillmentType: 'pickup',
  });
  assert.equal(response.status, 401);
});

test('customer creates a pickup order: stock decremented, price snapshotted server-side', async () => {
  const before = await stockOf(widgetA);
  const response = await custClient.post('/orders', {
    productId: widgetA,
    quantity: 2,
    fulfillmentType: 'pickup',
  });
  assert.equal(response.status, 201);
  const order = response.data.order;
  assert.match(order.order_code, /^GL-ORD-\d{5}$/);
  assert.equal(order.status, 'pending_confirmation');
  assert.equal(order.origin, 'direct');
  assert.equal(order.customer_id, customerId);
  assert.equal(order.merchant_id, merchantId);
  assert.equal(order.shop_id, shopId);
  assert.equal(order.product_id, widgetA);
  assert.equal(order.quantity, 2);
  assert.equal(order.unit_price, 250.5);
  assert.equal(order.total_amount, 501);
  assert.equal(order.fulfillment_type, 'pickup');
  assert.equal(order.delivery_address, null);
  assert.equal(order.product_name, 'Widget A');
  assert.equal(await stockOf(widgetA), before - 2);
});

test('insufficient stock is rejected with 409 and decrements nothing', async () => {
  const before = await stockOf(widgetA);
  const { rows } = await app.pool.query('SELECT COUNT(*)::int AS n FROM orders');
  const ordersBefore = rows[0].n;

  const response = await custClient.post('/orders', {
    productId: widgetA,
    quantity: before + 1,
    fulfillmentType: 'pickup',
  });
  assert.equal(response.status, 409);
  assert.equal(response.data.error.code, 'CONFLICT');
  assert.equal(await stockOf(widgetA), before);
  const { rows: after } = await app.pool.query('SELECT COUNT(*)::int AS n FROM orders');
  assert.equal(after[0].n, ordersBefore);
});

test('delivery orders require an address (400) and store it when given (201)', async () => {
  const missing = await custClient.post('/orders', {
    productId: widgetA,
    quantity: 1,
    fulfillmentType: 'delivery',
  });
  assert.equal(missing.status, 400);
  assert.equal(missing.data.error.code, 'VALIDATION_ERROR');

  const before = await stockOf(widgetA);
  const ok = await custClient.post('/orders', {
    productId: widgetA,
    quantity: 1,
    fulfillmentType: 'delivery',
    deliveryAddress: '42 MG Road, Nagpur',
  });
  assert.equal(ok.status, 201);
  assert.equal(ok.data.order.fulfillment_type, 'delivery');
  assert.equal(ok.data.order.delivery_address, '42 MG Road, Nagpur');
  assert.equal(await stockOf(widgetA), before - 1);
});

test('order lists are scoped to the caller', async () => {
  const mine = await custClient.get('/orders/mine');
  assert.equal(mine.status, 200);
  assert.ok(Array.isArray(mine.data.orders));
  assert.ok(mine.data.total >= 2);
  assert.ok(mine.data.orders.every((o) => o.customer_id === customerId));
  assert.ok(mine.data.orders.every((o) => typeof o.product_name === 'string'));

  const otherMine = await cust2Client.get('/orders/mine');
  assert.equal(otherMine.status, 200);
  assert.equal(otherMine.data.total, 0);

  const shop = await merchClient.get('/orders/shop');
  assert.equal(shop.status, 200);
  assert.ok(shop.data.orders.every((o) => o.merchant_id === merchantId));

  const pendingOnly = await merchClient.get('/orders/shop?status=pending_confirmation');
  assert.equal(pendingOnly.status, 200);
  assert.ok(pendingOnly.data.orders.every((o) => o.status === 'pending_confirmation'));

  assert.equal((await custClient.get('/orders/shop')).status, 403);
  assert.equal((await merchClient.get('/orders/mine')).status, 403);
});

test('GET /orders/:id is visible to participants only', async () => {
  const created = await custClient.post('/orders', {
    productId: widgetA,
    quantity: 1,
    fulfillmentType: 'pickup',
  });
  const id = created.data.order.id;

  assert.equal((await custClient.get(`/orders/${id}`)).status, 200);
  assert.equal((await merchClient.get(`/orders/${id}`)).status, 200);
  assert.equal((await cust2Client.get(`/orders/${id}`)).status, 403);
  assert.equal((await merch2Client.get(`/orders/${id}`)).status, 403);
  assert.equal((await custClient.get('/orders/not-a-uuid')).status, 400);
});

test('status machine: valid merchant chain pending → confirmed → ready_for_pickup → completed', async () => {
  const created = await custClient.post('/orders', {
    productId: widgetC,
    quantity: 1,
    fulfillmentType: 'pickup',
  });
  const id = created.data.order.id;

  for (const status of ['confirmed', 'ready_for_pickup', 'completed']) {
    const response = await merchClient.patch(`/orders/${id}/status`, { status });
    assert.equal(response.status, 200);
    assert.equal(response.data.order.status, status);
  }
});

test('status machine: invalid transitions return 422 and strangers are rejected', async () => {
  const created = await custClient.post('/orders', {
    productId: widgetC,
    quantity: 1,
    fulfillmentType: 'pickup',
  });
  const id = created.data.order.id;

  const skip = await merchClient.patch(`/orders/${id}/status`, { status: 'completed' });
  assert.equal(skip.status, 422);
  assert.equal(skip.data.error.code, 'INVALID_TRANSITION');

  const customerStatus = await merchClient.patch(`/orders/${id}/status`, {
    status: 'cancelled_by_customer',
  });
  assert.equal(customerStatus.status, 422);

  const bogus = await merchClient.patch(`/orders/${id}/status`, { status: 'pending' });
  assert.equal(bogus.status, 400);

  assert.equal((await merch2Client.patch(`/orders/${id}/status`, { status: 'confirmed' })).status, 403);
  assert.equal((await custClient.patch(`/orders/${id}/status`, { status: 'confirmed' })).status, 403);

  const confirmed = await merchClient.patch(`/orders/${id}/status`, { status: 'confirmed' });
  assert.equal(confirmed.status, 200);
  const back = await merchClient.patch(`/orders/${id}/status`, { status: 'pending_confirmation' });
  assert.equal(back.status, 422);
});

test('cancel restores stock in the same transaction and only works while pending', async () => {
  const before = await stockOf(widgetA);
  const created = await custClient.post('/orders', {
    productId: widgetA,
    quantity: 2,
    fulfillmentType: 'pickup',
  });
  assert.equal(await stockOf(widgetA), before - 2);

  const cancelled = await custClient.post(`/orders/${created.data.order.id}/cancel`);
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.data.order.status, 'cancelled_by_customer');
  assert.equal(await stockOf(widgetA), before);

  const again = await custClient.post(`/orders/${created.data.order.id}/cancel`);
  assert.equal(again.status, 422);

  const patchVerb = await custClient.patch(`/orders/${created.data.order.id}/cancel`);
  assert.equal(patchVerb.status, 422);

  const other = await cust2Client.post(`/orders/${created.data.order.id}/cancel`);
  assert.equal(other.status, 403);
});

test('cancel window closes once the merchant confirms', async () => {
  const before = await stockOf(widgetA);
  const created = await custClient.post('/orders', {
    productId: widgetA,
    quantity: 1,
    fulfillmentType: 'pickup',
  });
  const confirmed = await merchClient.patch(`/orders/${created.data.order.id}/status`, {
    status: 'confirmed',
  });
  assert.equal(confirmed.status, 200);

  const cancelled = await custClient.post(`/orders/${created.data.order.id}/cancel`);
  assert.equal(cancelled.status, 422);
  assert.equal(await stockOf(widgetA), before - 1);
});

test('merchant rejection also restores stock', async () => {
  const before = await stockOf(widgetB);
  const created = await custClient.post('/orders', {
    productId: widgetB,
    quantity: 2,
    fulfillmentType: 'pickup',
  });
  assert.equal(await stockOf(widgetB), before - 2);

  const rejected = await merchClient.patch(`/orders/${created.data.order.id}/status`, {
    status: 'rejected_by_merchant',
  });
  assert.equal(rejected.status, 200);
  assert.equal(rejected.data.order.status, 'rejected_by_merchant');
  assert.equal(await stockOf(widgetB), before);
});

test('socket.io client in the customer room receives order:created after commit', async () => {
  const socket = io(app.baseUrl, { auth: { token: custToken }, transports: ['websocket'] });
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });

  const received = new Promise((resolve) => socket.once(EVENTS.ORDER_CREATED, resolve));
  const response = await custClient.post('/orders', {
    productId: widgetA,
    quantity: 1,
    fulfillmentType: 'pickup',
  });
  assert.equal(response.status, 201);

  const event = await Promise.race([
    received,
    new Promise((_, reject) => setTimeout(() => reject(new Error('order:created not received')), 5000)),
  ]);
  assert.equal(event.id, response.data.order.id);
  assert.equal(event.order_code, response.data.order.order_code);
  assert.equal(event.status, 'pending_confirmation');
  socket.close();
});
