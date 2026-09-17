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
let shop2Id;
let productX;
let productY;
let productZ;
let productW;

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

async function createEnquiry({ productId, message } = {}) {
  const response = await custClient.post('/enquiries', {
    shopId,
    ...(productId ? { productId } : {}),
    message: message ?? 'Do you have this item available?',
  });
  assert.equal(response.status, 201);
  return response.data.enquiry;
}

async function createOffer(enquiryId, overrides = {}) {
  const response = await merchClient.post('/offers', { enquiryId, price: 150, ...overrides });
  assert.equal(response.status, 201);
  return response.data.offer;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  ({ EVENTS } = await import('../../src/realtime/events.js'));
  await truncateAll();

  custClient = makeClient(app.baseUrl);
  const cust = await custClient.post('/auth/customer/signup', {
    fullName: 'EO Customer',
    email: 'wb-eo-cust@test.local',
    password: 'Password123',
  });
  assert.equal(cust.status, 201);
  custClient.setToken(cust.data.accessToken);
  custToken = cust.data.accessToken;
  customerId = cust.data.user.id;

  cust2Client = makeClient(app.baseUrl);
  const cust2 = await cust2Client.post('/auth/customer/signup', {
    fullName: 'EO Other',
    email: 'wb-eo-other@test.local',
    password: 'Password123',
  });
  cust2Client.setToken(cust2.data.accessToken);

  merchClient = makeClient(app.baseUrl);
  const merch = await merchClient.post('/auth/merchant/signup', {
    ownerName: 'EO Owner',
    businessName: 'EO Shop Pvt',
    email: 'wb-eo-merchant@test.local',
    password: 'Password123',
    phone: '9876543210',
  });
  merchClient.setToken(merch.data.accessToken);
  merchantId = merch.data.user.id;

  merch2Client = makeClient(app.baseUrl);
  const merch2 = await merch2Client.post('/auth/merchant/signup', {
    ownerName: 'EO Rival Owner',
    businessName: 'EO Rival Shop Pvt',
    email: 'wb-eo-rival@test.local',
    password: 'Password123',
    phone: '9876543211',
  });
  merch2Client.setToken(merch2.data.accessToken);

  shopId = await insertShop(merchantId, 'EO Shop');
  shop2Id = await insertShop(merch2.data.user.id, 'EO Rival Shop');
  productX = await insertProduct(shopId, 'EO Widget X', 500, 4);
  productY = await insertProduct(shopId, 'EO Widget Y', 300, 5);
  productZ = await insertProduct(shopId, 'EO Widget Z', 100, 1);
  productW = await insertProduct(shop2Id, 'EO Rival Widget', 200, 5);
});

test.after(async () => {
  await app.stop();
});

test('POST /enquiries requires customer authentication', async () => {
  const anon = await makeClient(app.baseUrl).post('/enquiries', { shopId, message: 'hello' });
  assert.equal(anon.status, 401);
  const merchant = await merchClient.post('/enquiries', { shopId, message: 'hello' });
  assert.equal(merchant.status, 403);
});

test('customer creates product and shop enquiries', async () => {
  const response = await custClient.post('/enquiries', {
    shopId,
    productId: productX,
    message: 'Can you confirm current stock?',
    requestedSize: 'large',
    budget: 'around 500',
  });
  assert.equal(response.status, 201);
  const enquiry = response.data.enquiry;
  assert.match(enquiry.enquiry_code, /^GL-ENQ-\d{5}$/);
  assert.equal(enquiry.status, 'pending');
  assert.equal(enquiry.customer_id, customerId);
  assert.equal(enquiry.shop_id, shopId);
  assert.equal(enquiry.product_id, productX);
  assert.equal(enquiry.product_name, 'EO Widget X');
  assert.equal(enquiry.shop_name, 'EO Shop');
  assert.equal(enquiry.requested_size, 'large');
  assert.equal(enquiry.budget, 'around 500');

  const shopOnly = await custClient.post('/enquiries', {
    shopId,
    message: 'Do you sell gardening tools?',
  });
  assert.equal(shopOnly.status, 201);
  assert.equal(shopOnly.data.enquiry.product_id, null);
  assert.equal(shopOnly.data.enquiry.product_name, null);
});

test('enquiry creation validation', async () => {
  const missingMessage = await custClient.post('/enquiries', { shopId });
  assert.equal(missingMessage.status, 400);
  assert.equal(missingMessage.data.error.code, 'VALIDATION_ERROR');

  const unknownShop = await custClient.post('/enquiries', {
    shopId: '00000000-0000-0000-0000-000000000000',
    message: 'hello',
  });
  assert.equal(unknownShop.status, 404);

  const mismatch = await custClient.post('/enquiries', {
    shopId,
    productId: productW,
    message: 'hello',
  });
  assert.equal(mismatch.status, 422);
  assert.equal(mismatch.data.error.code, 'PRODUCT_SHOP_MISMATCH');
});

test('enquiry lists are scoped to the caller', async () => {
  const mine = await custClient.get('/enquiries/mine');
  assert.equal(mine.status, 200);
  assert.ok(Array.isArray(mine.data.enquiries));
  assert.ok(mine.data.total >= 2);
  assert.ok(mine.data.enquiries.every((e) => e.customer_id === customerId));
  assert.ok(mine.data.enquiries.every((e) => typeof e.shop_name === 'string'));

  const otherMine = await cust2Client.get('/enquiries/mine');
  assert.equal(otherMine.status, 200);
  assert.equal(otherMine.data.total, 0);

  const shop = await merchClient.get('/enquiries/shop');
  assert.equal(shop.status, 200);
  assert.ok(shop.data.enquiries.every((e) => e.merchant_id === merchantId));

  const pendingOnly = await merchClient.get('/enquiries/shop?status=pending');
  assert.equal(pendingOnly.status, 200);
  assert.ok(pendingOnly.data.enquiries.every((e) => e.status === 'pending'));

  assert.equal((await custClient.get('/enquiries/shop')).status, 403);
  assert.equal((await merchClient.get('/enquiries/mine')).status, 403);
});

test('enquiry status transitions enforce the state machine', async () => {
  const enquiry = await createEnquiry({ productId: productY });

  const stranger = await merch2Client.patch(`/enquiries/${enquiry.id}/status`, {
    status: 'responded',
  });
  assert.equal(stranger.status, 403);
  const otherCustomer = await cust2Client.patch(`/enquiries/${enquiry.id}/status`, {
    status: 'declined',
  });
  assert.equal(otherCustomer.status, 403);

  const responded = await merchClient.patch(`/enquiries/${enquiry.id}/status`, {
    status: 'responded',
  });
  assert.equal(responded.status, 200);
  assert.equal(responded.data.enquiry.status, 'responded');

  const again = await merchClient.patch(`/enquiries/${enquiry.id}/status`, { status: 'responded' });
  assert.equal(again.status, 422);
  assert.equal(again.data.error.code, 'INVALID_TRANSITION');

  const bogus = await merchClient.patch(`/enquiries/${enquiry.id}/status`, { status: 'bogus' });
  assert.equal(bogus.status, 400);
  const badUuid = await merchClient.patch('/enquiries/not-a-uuid/status', { status: 'responded' });
  assert.equal(badUuid.status, 400);
});

test('customer can decline an enquiry and terminal states are final', async () => {
  const enquiry = await createEnquiry({ productId: productY });
  const declined = await custClient.patch(`/enquiries/${enquiry.id}/status`, { status: 'declined' });
  assert.equal(declined.status, 200);
  assert.equal(declined.data.enquiry.status, 'declined');

  const again = await custClient.patch(`/enquiries/${enquiry.id}/status`, { status: 'responded' });
  assert.equal(again.status, 422);
});

test('offer creation guards: role, ownership, open product-backed enquiry', async () => {
  const unknown = await merchClient.post('/offers', {
    enquiryId: '00000000-0000-0000-0000-000000000000',
    price: 100,
  });
  assert.equal(unknown.status, 404);

  const asCustomer = await custClient.post('/offers', {
    enquiryId: '00000000-0000-0000-0000-000000000000',
    price: 100,
  });
  assert.equal(asCustomer.status, 403);

  const rival = await custClient.post('/enquiries', {
    shopId: shop2Id,
    productId: productW,
    message: 'Rival shop enquiry',
  });
  const crossShop = await merchClient.post('/offers', {
    enquiryId: rival.data.enquiry.id,
    price: 150,
  });
  assert.equal(crossShop.status, 403);

  const productless = await createEnquiry({ message: 'Any deals on tools?' });
  const noProduct = await merchClient.post('/offers', { enquiryId: productless.id, price: 150 });
  assert.equal(noProduct.status, 422);
  assert.equal(noProduct.data.error.code, 'NO_PRODUCT');

  const declinedEnquiry = await createEnquiry({ productId: productY });
  await custClient.patch(`/enquiries/${declinedEnquiry.id}/status`, { status: 'declined' });
  const closed = await merchClient.post('/offers', { enquiryId: declinedEnquiry.id, price: 150 });
  assert.equal(closed.status, 409);
});

test('offer creation validation', async () => {
  const enquiry = await createEnquiry({ productId: productY });

  const zeroPrice = await merchClient.post('/offers', { enquiryId: enquiry.id, price: 0 });
  assert.equal(zeroPrice.status, 400);
  assert.equal(zeroPrice.data.error.code, 'VALIDATION_ERROR');

  const past = await merchClient.post('/offers', {
    enquiryId: enquiry.id,
    price: 150,
    expiresAt: new Date(Date.now() - 3600000).toISOString(),
  });
  assert.equal(past.status, 422);
  assert.equal(past.data.error.code, 'INVALID_EXPIRY');
});

test('a merchant offer flips the enquiry to offer_sent and reaches the customer in realtime', async () => {
  const socket = io(app.baseUrl, { auth: { token: custToken }, transports: ['websocket'] });
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });

  const enquiry = await createEnquiry({ productId: productX });
  const received = new Promise((resolve) => socket.once(EVENTS.OFFER_CREATED, resolve));

  const created = await merchClient.post('/offers', {
    enquiryId: enquiry.id,
    price: 450,
    originalPrice: 500,
    message: 'Special price for you',
  });
  assert.equal(created.status, 201);
  const offer = created.data.offer;

  assert.equal(offer.status, 'sent');
  assert.equal(offer.price, 450);
  assert.equal(offer.original_price, 500);
  assert.equal(offer.product_name, 'EO Widget X');
  assert.equal(offer.shop_name, 'EO Shop');
  assert.ok(new Date(offer.expires_at).getTime() > Date.now());
  assert.equal(created.data.enquiry.status, 'offer_sent');

  const event = await Promise.race([
    received,
    new Promise((_, reject) => setTimeout(() => reject(new Error('offer:created not received')), 5000)),
  ]);
  assert.equal(event.id, offer.id);
  assert.equal(event.status, 'sent');
  socket.close();
});

test('offer lists and detail are scoped to participants', async () => {
  const mine = await custClient.get('/offers');
  assert.equal(mine.status, 200);
  assert.ok(mine.data.total >= 1);
  assert.ok(mine.data.offers.every((o) => o.customer_id === customerId));

  assert.equal((await cust2Client.get('/offers')).data.total, 0);
  assert.equal((await merch2Client.get('/offers')).data.total, 0);

  const shopOffers = await merchClient.get('/offers');
  assert.equal(shopOffers.status, 200);
  assert.ok(shopOffers.data.offers.every((o) => o.merchant_id === merchantId));

  const sentOnly = await merchClient.get('/offers?status=sent');
  assert.equal(sentOnly.status, 200);
  assert.ok(sentOnly.data.offers.every((o) => o.status === 'sent'));

  const first = mine.data.offers[0];
  assert.equal((await custClient.get(`/offers/${first.id}`)).status, 200);
  assert.equal((await merchClient.get(`/offers/${first.id}`)).status, 200);
  assert.equal((await cust2Client.get(`/offers/${first.id}`)).status, 403);
  assert.equal((await merch2Client.get(`/offers/${first.id}`)).status, 403);
  assert.equal((await custClient.get('/offers/not-a-uuid')).status, 400);
});

test('accepting an offer atomically creates the order at the offer price', async () => {
  const before = await stockOf(productX);
  const enquiry = await createEnquiry({ productId: productX });
  const offer = await createOffer(enquiry.id, { price: 450 });

  const accepted = await custClient.post(`/offers/${offer.id}/accept`, {});
  assert.equal(accepted.status, 201);
  const { order, offer: acceptedOffer, enquiry: acceptedEnquiry } = accepted.data;

  assert.equal(order.status, 'pending_confirmation');
  assert.equal(order.origin, 'offer_accepted');
  assert.equal(order.product_id, productX);
  assert.equal(order.shop_id, shopId);
  assert.equal(order.merchant_id, merchantId);
  assert.equal(order.customer_id, customerId);
  assert.equal(order.enquiry_id, enquiry.id);
  assert.equal(order.offer_id, offer.id);
  assert.equal(order.quantity, 1);
  assert.equal(order.unit_price, 450);
  assert.equal(order.total_amount, 450);
  assert.equal(order.fulfillment_type, 'pickup');
  assert.equal(order.product_name, 'EO Widget X');
  assert.equal(acceptedOffer.status, 'accepted');
  assert.equal(acceptedEnquiry.status, 'accepted');
  assert.equal(await stockOf(productX), before - 1);

  const again = await custClient.post(`/offers/${offer.id}/accept`, {});
  assert.equal(again.status, 409);
});

test('accept honors quantity and delivery details from the request', async () => {
  const before = await stockOf(productX);
  const enquiry = await createEnquiry({ productId: productX });
  const offer = await createOffer(enquiry.id, { price: 210 });

  const accepted = await custClient.post(`/offers/${offer.id}/accept`, {
    quantity: 2,
    fulfillmentType: 'delivery',
    deliveryAddress: '7 Lake Road, Nagpur',
  });
  assert.equal(accepted.status, 201);
  const { order } = accepted.data;
  assert.equal(order.quantity, 2);
  assert.equal(order.unit_price, 210);
  assert.equal(order.total_amount, 420);
  assert.equal(order.fulfillment_type, 'delivery');
  assert.equal(order.delivery_address, '7 Lake Road, Nagpur');
  assert.equal(await stockOf(productX), before - 2);
});

test('expired offers can no longer be accepted', async () => {
  const enquiry = await createEnquiry({ productId: productY });
  const stale = await createOffer(enquiry.id, { price: 120 });
  await app.pool.query(`UPDATE offers SET expires_at = now() - interval '1 hour' WHERE id = $1`, [
    stale.id,
  ]);
  assert.equal((await custClient.post(`/offers/${stale.id}/accept`, {})).status, 409);

  const flipped = await createOffer(enquiry.id, { price: 130 });
  await app.pool.query(`UPDATE offers SET status = 'expired' WHERE id = $1`, [flipped.id]);
  assert.equal((await custClient.post(`/offers/${flipped.id}/accept`, {})).status, 409);
});

test('insufficient stock rolls the whole accept back', async () => {
  const enquiry = await createEnquiry({ productId: productZ });
  const offer = await createOffer(enquiry.id, { price: 90 });

  const response = await custClient.post(`/offers/${offer.id}/accept`, { quantity: 2 });
  assert.equal(response.status, 409);
  assert.equal(response.data.error.code, 'CONFLICT');

  const { rows } = await app.pool.query('SELECT COUNT(*)::int AS n FROM orders WHERE offer_id = $1', [
    offer.id,
  ]);
  assert.equal(rows[0].n, 0);
  const offerRow = (await app.pool.query('SELECT status FROM offers WHERE id = $1', [offer.id]))
    .rows[0];
  assert.equal(offerRow.status, 'sent');
  const enquiryRow = (
    await app.pool.query('SELECT status FROM enquiries WHERE id = $1', [enquiry.id])
  ).rows[0];
  assert.equal(enquiryRow.status, 'offer_sent');
  assert.equal(await stockOf(productZ), 1);
});

test('rejecting an offer reopens the enquiry for a new offer', async () => {
  const enquiry = await createEnquiry({ productId: productY });
  const first = await createOffer(enquiry.id, { price: 250 });

  const rejected = await custClient.post(`/offers/${first.id}/reject`);
  assert.equal(rejected.status, 200);
  assert.equal(rejected.data.offer.status, 'rejected');
  assert.equal(rejected.data.enquiry.status, 'responded');

  const second = await createOffer(enquiry.id, { price: 240 });
  assert.equal(second.status, 'sent');
  const accepted = await custClient.post(`/offers/${second.id}/accept`, {});
  assert.equal(accepted.status, 201);
  assert.equal(accepted.data.order.unit_price, 240);
});

test('POST /orders with offerId routes through the accept flow', async () => {
  const before = await stockOf(productY);
  const enquiry = await createEnquiry({ productId: productY });
  const offer = await createOffer(enquiry.id, { price: 280 });

  const response = await custClient.post('/orders', {
    offerId: offer.id,
    quantity: 1,
    fulfillmentType: 'pickup',
  });
  assert.equal(response.status, 201);
  const { order } = response.data;
  assert.equal(order.origin, 'offer_accepted');
  assert.equal(order.unit_price, 280);
  assert.equal(order.status, 'pending_confirmation');
  assert.equal(order.offer_id, offer.id);
  assert.equal(await stockOf(productY), before - 1);
});

test('an expired enquiry blocks offer acceptance', async () => {
  const enquiry = await createEnquiry({ productId: productY });
  const offer = await createOffer(enquiry.id, { price: 175 });
  await app.pool.query(`UPDATE enquiries SET status = 'expired' WHERE id = $1`, [enquiry.id]);
  const response = await custClient.post(`/offers/${offer.id}/accept`, {});
  assert.equal(response.status, 409);
});

test('only the addressed customer can accept or reject an offer', async () => {
  const enquiry = await createEnquiry({ productId: productY });
  const offer = await createOffer(enquiry.id, { price: 160 });

  assert.equal((await cust2Client.post(`/offers/${offer.id}/accept`, {})).status, 403);
  assert.equal((await cust2Client.post(`/offers/${offer.id}/reject`)).status, 403);
  assert.equal((await custClient.post(`/offers/${offer.id}/reject`)).status, 200);
});
