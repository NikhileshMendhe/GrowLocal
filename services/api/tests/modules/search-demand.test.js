import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/growlocal_wc';

let app;
let customer;
let outsider;
let merchant;
let bakeryShopId;
let gadgetsShopId;
let closedShopId;
let locationId;
let fudgeCakeProductId;

function authedClient(token) {
  const client = makeClient(app.baseUrl);
  client.setToken(token);
  return client;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const client = makeClient(app.baseUrl);
  const customerSignup = await client.post('/auth/customer/signup', {
    fullName: 'Search Customer',
    email: 'search-customer@test.local',
    password: 'Password123',
  });
  assert.equal(customerSignup.status, 201);
  customer = { token: customerSignup.data.accessToken, id: customerSignup.data.user.id };

  const outsiderSignup = await client.post('/auth/customer/signup', {
    fullName: 'Outsider Customer',
    email: 'search-outsider@test.local',
    password: 'Password123',
  });
  assert.equal(outsiderSignup.status, 201);
  outsider = { token: outsiderSignup.data.accessToken, id: outsiderSignup.data.user.id };

  const merchantSignup = await client.post('/auth/merchant/signup', {
    ownerName: 'Search Owner',
    businessName: 'Search Merchant Pvt',
    email: 'search-merchant@test.local',
    password: 'Password123',
    phone: '9876543210',
  });
  assert.equal(merchantSignup.status, 201);
  merchant = { token: merchantSignup.data.accessToken, id: merchantSignup.data.user.id };

  const { rows: locationRows } = await app.pool.query(
    `INSERT INTO locations (city, state, area, latitude, longitude)
     VALUES ('Nagpur', 'Maharashtra', 'Dharampeth', 21.1458, 79.0882)
     RETURNING id`,
  );
  locationId = locationRows[0].id;

  const { rows: shopRows } = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city, latitude, longitude, status)
     VALUES ($1, 'Chocolate Loco Bakery', '1 Test Street', 'Nagpur', 21.1460, 79.0890, 'open'),
            ($1, 'TechZone Gadgets', '2 Test Street', 'Nagpur', 21.1470, 79.0900, 'open'),
            ($1, 'Closed Mart', '3 Test Street', 'Nagpur', 21.1480, 79.0910, 'closed')
     RETURNING id`,
    [merchant.id]
  );
  bakeryShopId = shopRows[0].id;
  gadgetsShopId = shopRows[1].id;
  closedShopId = shopRows[2].id;

  const { rows: productRows } = await app.pool.query(
    `INSERT INTO products (shop_id, name, description, price, approval_status)
     VALUES ($1, 'Chocolate Fudge Cake', 'Rich chocolate cake', 500, 'approved'),
            ($1, 'Dark Chocolate Bar', '70% cocoa', 100, 'approved'),
            ($2, 'Smartphone X', 'Latest flagship', 50000, 'approved'),
            ($2, 'Smartphone X Pro Unreleased', 'Pending approval', 60000, 'pending'),
            ($3, 'Chocolate From Closed Mart', 'Should not appear', 200, 'approved')
     RETURNING id, name`,
    [bakeryShopId, gadgetsShopId, closedShopId]
  );
  fudgeCakeProductId = productRows[0].id;

  await app.pool.query(
    `INSERT INTO product_images (product_id, image_url, display_order)
     VALUES ($1, 'https://cdn.example.com/fudge-cake.jpg', 0)`,
    [fudgeCakeProductId]
  );

  await app.pool.query(
    `INSERT INTO search_history (search_query)
     VALUES ('chocolate'), ('chocolate'), ('chocolate'),
            ('cake'),
            ('vintage camera'), ('vintage camera')`
  );
});

test.after(async () => {
  await app.stop();
});

test('unified search returns ranked shops + products and excludes unapproved/closed results', async () => {
  const response = await authedClient(customer.token).post('/search', { query: 'chocolate' });
  assert.equal(response.status, 200);

  assert.equal(response.data.query, 'chocolate');
  assert.equal(response.data.productTotal, 2);
  const productNames = response.data.products.map((p) => p.name);
  assert.ok(productNames.includes('Chocolate Fudge Cake'));
  assert.ok(productNames.includes('Dark Chocolate Bar'));
  assert.ok(!productNames.includes('Chocolate From Closed Mart'));
  assert.equal(response.data.products[0].shop_name, 'Chocolate Loco Bakery');
  const fudgeCake = response.data.products.find((p) => p.name === 'Chocolate Fudge Cake');
  assert.equal(fudgeCake.image_url, 'https://cdn.example.com/fudge-cake.jpg');

  assert.equal(response.data.shopTotal, 1);
  assert.equal(response.data.shops[0].name, 'Chocolate Loco Bakery');

  const smartphone = await authedClient(customer.token).post('/search', { query: 'Smartphone X' });
  assert.equal(smartphone.status, 200);
  assert.equal(smartphone.data.productTotal, 1);
  assert.equal(smartphone.data.products[0].name, 'Smartphone X');
});

test('name matches rank ahead of description matches', async () => {
  const response = await authedClient(customer.token).post('/search', { query: 'cocoa' });
  assert.equal(response.status, 200);
  assert.equal(response.data.productTotal, 1);
  assert.equal(response.data.products[0].name, 'Dark Chocolate Bar');

  const descriptionMatch = await authedClient(customer.token).post('/search', { query: 'flagship' });
  assert.equal(descriptionMatch.status, 200);
  assert.equal(descriptionMatch.data.productTotal, 1);
  assert.equal(descriptionMatch.data.products[0].name, 'Smartphone X');
});

test('geo filter: lat/lng + radiusKm excludes distant shops and their products', async () => {
  const near = await authedClient(customer.token).post('/search', {
    query: 'chocolate',
    lat: 21.1458,
    lng: 79.0882,
    radiusKm: 5,
  });
  assert.equal(near.status, 200);
  assert.equal(near.data.shopTotal, 1);
  assert.equal(near.data.productTotal, 2);
  assert.ok(near.data.shops[0].distance_km <= 5);

  const far = await authedClient(customer.token).post('/search', {
    query: 'chocolate',
    lat: 28.6139,
    lng: 77.209,
    radiusKm: 5,
  });
  assert.equal(far.status, 200);
  assert.equal(far.data.shopTotal, 0);
  assert.equal(far.data.productTotal, 0);
});

test('search with no matches returns empty lists', async () => {
  const response = await authedClient(customer.token).post('/search', {
    query: 'zzz-no-such-thing',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.shopTotal, 0);
  assert.equal(response.data.productTotal, 0);
  assert.deepEqual(response.data.shops, []);
  assert.deepEqual(response.data.products, []);
});

test('anonymous search works and is recorded with a NULL customer_id; invalid tokens are rejected', async () => {
  const anonymous = await makeClient(app.baseUrl).post('/search', { query: 'bakery' });
  assert.equal(anonymous.status, 200);
  assert.equal(anonymous.data.shopTotal, 1);
  assert.equal(anonymous.data.productTotal, 0);

  const { rows } = await app.pool.query(
    `SELECT customer_id FROM search_history WHERE search_query = 'bakery'`
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].customer_id, null);

  const { rows: attributed } = await app.pool.query(
    `SELECT customer_id FROM search_history
      WHERE search_query = 'chocolate' AND customer_id IS NOT NULL`
  );
  assert.ok(attributed.length >= 1);
  assert.equal(attributed[0].customer_id, customer.id);

  const badToken = makeClient(app.baseUrl);
  badToken.setToken('not-a-jwt');
  const rejected = await badToken.post('/search', { query: 'cake' });
  assert.equal(rejected.status, 401);
});

test('popular searches are aggregated and ordered by count', async () => {
  const response = await makeClient(app.baseUrl).get('/search/popular');
  assert.equal(response.status, 200);
  const { searches } = response.data;
  assert.ok(searches.length >= 3);
  assert.equal(searches[0].query, 'chocolate');
  assert.equal(searches[0].count, 6);
  const counts = searches.map((s) => s.count);
  for (let i = 1; i < counts.length; i += 1) {
    assert.ok(counts[i - 1] >= counts[i]);
  }
});

test('demand gaps: searched terms with no matching approved products', async () => {
  const response = await makeClient(app.baseUrl).get('/search/demand-gaps');
  assert.equal(response.status, 200);
  const queries = response.data.gaps.map((g) => g.query);
  assert.ok(queries.includes('vintage camera'));
  assert.ok(!queries.includes('chocolate'));
  assert.ok(!queries.includes('cake'));
  assert.ok(!queries.includes('Smartphone X'));
  const gap = response.data.gaps.find((g) => g.query === 'vintage camera');
  assert.equal(gap.count, 2);
});

test('customer submits a demand request; validation and role guards hold', async () => {
  const client = authedClient(customer.token);
  const created = await client.post('/demand-requests', {
    productName: 'Vintage Camera',
    budget: '5000',
    locationId,
    radiusKm: 5,
    description: 'Looking for a working film camera',
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.demandRequest.status, 'broadcasted');
  assert.equal(created.data.demandRequest.customer_id, customer.id);
  assert.equal(created.data.demandRequest.radius_km, 5);
  assert.equal(created.data.demandRequest.location_city, 'Nagpur');

  const tooShort = await client.post('/demand-requests', { productName: 'x' });
  assert.equal(tooShort.status, 400);

  const badLocation = await client.post('/demand-requests', {
    productName: 'Vintage Camera',
    locationId: '00000000-0000-0000-0000-000000000001',
  });
  assert.equal(badLocation.status, 404);

  const asMerchant = await authedClient(merchant.token).post('/demand-requests', {
    productName: 'Vintage Camera',
  });
  assert.equal(asMerchant.status, 403);

  const anonymous = await makeClient(app.baseUrl).post('/demand-requests', {
    productName: 'Vintage Camera',
  });
  assert.equal(anonymous.status, 401);
});

test('GET /demand-requests/mine lists own requests with response counts and status filter', async () => {
  const client = authedClient(customer.token);
  await client.post('/demand-requests', { productName: 'Mechanical Keyboard' });

  const mine = await client.get('/demand-requests/mine');
  assert.equal(mine.status, 200);
  assert.equal(mine.data.total, 2);
  assert.equal(mine.data.demandRequests[0].product_name, 'Mechanical Keyboard');
  assert.equal(mine.data.demandRequests[0].response_count, 0);

  const filtered = await client.get('/demand-requests/mine?status=broadcasted');
  assert.equal(filtered.data.total, 2);
  const none = await client.get('/demand-requests/mine?status=fulfilled');
  assert.equal(none.data.total, 0);

  const asOutsider = await authedClient(outsider.token).get('/demand-requests/mine');
  assert.equal(asOutsider.data.total, 0);
});

test('GET /demand-requests/nearby finds broadcasts within their radius', async () => {
  const near = await authedClient(merchant.token).get(
    '/demand-requests/nearby?lat=21.1458&lng=79.0882'
  );
  assert.equal(near.status, 200);
  assert.ok(near.data.total >= 1);
  const camera = near.data.demandRequests.find((d) => d.product_name === 'Vintage Camera');
  assert.ok(camera);
  assert.ok(camera.distance_km <= 5);

  const far = await authedClient(merchant.token).get(
    '/demand-requests/nearby?lat=28.6139&lng=77.209'
  );
  assert.equal(far.status, 200);
  assert.equal(far.data.total, 0);

  const noGeo = await authedClient(merchant.token).get('/demand-requests/nearby');
  assert.equal(noGeo.status, 200);
  assert.equal(noGeo.data.total, 2);
});

test('demand request detail and responses with access control', async () => {
  const mine = await authedClient(customer.token).get('/demand-requests/mine');
  const cameraRequest = mine.data.demandRequests.find(
    (d) => d.product_name === 'Vintage Camera'
  );

  const { rows: responseRows } = await app.pool.query(
    `INSERT INTO demand_responses (demand_request_id, shop_id, product_id, price, availability, message)
     VALUES ($1, $2, $3, 4500, 'available', 'We have one in stock')
     RETURNING id`,
    [cameraRequest.id, bakeryShopId, fudgeCakeProductId]
  );
  assert.equal(responseRows.length, 1);

  const detail = await authedClient(customer.token).get(`/demand-requests/${cameraRequest.id}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.data.demandRequest.responses.length, 1);
  assert.equal(detail.data.demandRequest.responses[0].shop_name, 'Chocolate Loco Bakery');
  assert.equal(detail.data.demandRequest.responses[0].product_name, 'Chocolate Fudge Cake');

  const responses = await authedClient(customer.token).get(
    `/demand-requests/${cameraRequest.id}/responses`
  );
  assert.equal(responses.status, 200);
  assert.equal(responses.data.total, 1);
  assert.equal(responses.data.responses[0].price, 4500);

  const asMerchant = await authedClient(merchant.token).get(
    `/demand-requests/${cameraRequest.id}`
  );
  assert.equal(asMerchant.status, 200);

  const asOutsider = await authedClient(outsider.token).get(`/demand-requests/${cameraRequest.id}`);
  assert.equal(asOutsider.status, 403);

  const outsiderResponses = await authedClient(outsider.token).get(
    `/demand-requests/${cameraRequest.id}/responses`
  );
  assert.equal(outsiderResponses.status, 403);

  const missing = await authedClient(customer.token).get(
    '/demand-requests/00000000-0000-0000-0000-000000000003'
  );
  assert.equal(missing.status, 404);
});
