import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/growlocal_wc';

let app;
let customerA;
let customerB;
let customerC;
let merchant;
let reviewedShopId;
let unreviewedShopId;
let productId;

function authedClient(token) {
  const client = makeClient(app.baseUrl);
  client.setToken(token);
  return client;
}

async function insertOrder({ customerId, shopId, status, code }) {
  const { rows } = await app.pool.query(
    `INSERT INTO orders (order_code, customer_id, shop_id, merchant_id, product_id,
       quantity, unit_price, total_amount, status)
     VALUES ($1, $2, $3, $4, $5, 1, 500, 500, $6)
     RETURNING id`,
    [code, customerId, shopId, merchant.id, productId, status]
  );
  return rows[0].id;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const client = makeClient(app.baseUrl);
  for (const [name, email] of [
    ['Review Alice', 'review-alice@test.local'],
    ['Review Bob', 'review-bob@test.local'],
    ['Review Carol', 'review-carol@test.local'],
  ]) {
    const signup = await client.post('/auth/customer/signup', {
      fullName: name,
      email,
      password: 'Password123',
    });
    assert.equal(signup.status, 201);
    if (email.includes('alice')) customerA = { token: signup.data.accessToken, id: signup.data.user.id };
    if (email.includes('bob')) customerB = { token: signup.data.accessToken, id: signup.data.user.id };
    if (email.includes('carol')) customerC = { token: signup.data.accessToken, id: signup.data.user.id };
  }

  const merchantSignup = await client.post('/auth/merchant/signup', {
    ownerName: 'Review Owner',
    businessName: 'Review Merchant Pvt',
    email: 'review-merchant@test.local',
    password: 'Password123',
    phone: '9876543210',
  });
  assert.equal(merchantSignup.status, 201);
  merchant = { token: merchantSignup.data.accessToken, id: merchantSignup.data.user.id };

  const { rows: shopRows } = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city)
     VALUES ($1, 'Reviewable Shop', '1 Test Street', 'Nagpur'),
            ($1, 'Unreviewed Shop', '2 Test Street', 'Nagpur')
     RETURNING id`,
    [merchant.id]
  );
  reviewedShopId = shopRows[0].id;
  unreviewedShopId = shopRows[1].id;

  const { rows: productRows } = await app.pool.query(
    `INSERT INTO products (shop_id, name, price)
     VALUES ($1, 'Reviewable Widget', 500)
     RETURNING id`,
    [reviewedShopId]
  );
  productId = productRows[0].id;

  const suffix = Date.now();
  await insertOrder({ customerId: customerA.id, shopId: reviewedShopId, status: 'completed', code: `GL-TEST-A-${suffix}` });
  await insertOrder({ customerId: customerB.id, shopId: reviewedShopId, status: 'pending_confirmation', code: `GL-TEST-B-${suffix}` });
  await insertOrder({ customerId: customerC.id, shopId: reviewedShopId, status: 'completed', code: `GL-TEST-C-${suffix}` });
});

test.after(async () => {
  await app.stop();
});

test('review without a delivered order at the shop is rejected (403)', async () => {
  const noOrder = await authedClient(customerB.token).post('/reviews', {
    shopId: reviewedShopId,
    rating: 5,
  });
  assert.equal(noOrder.status, 403);

  const wrongShop = await authedClient(customerA.token).post('/reviews', {
    shopId: unreviewedShopId,
    rating: 5,
  });
  assert.equal(wrongShop.status, 403);
});

test('review for a nonexistent shop returns 404; rating out of range returns 400', async () => {
  const client = authedClient(customerA.token);
  const missing = await client.post('/reviews', {
    shopId: '00000000-0000-0000-0000-000000000001',
    rating: 4,
  });
  assert.equal(missing.status, 404);

  const badRating = await client.post('/reviews', {
    shopId: reviewedShopId,
    rating: 6,
  });
  assert.equal(badRating.status, 400);
});

test('customer with a delivered order posts a review; shops.rating/review_count recompute atomically', async () => {
  const first = await authedClient(customerA.token).post('/reviews', {
    shopId: reviewedShopId,
    rating: 4,
    reviewText: 'Solid widget',
    productId,
  });
  assert.equal(first.status, 201);
  assert.equal(first.data.review.rating, 4);
  assert.equal(first.data.review.status, 'published');
  assert.equal(first.data.shop.rating, 4);
  assert.equal(first.data.shop.review_count, 1);

  const { rows: shopRows } = await app.pool.query(
    'SELECT rating, review_count FROM shops WHERE id = $1',
    [reviewedShopId]
  );
  assert.equal(shopRows[0].rating, 4);
  assert.equal(shopRows[0].review_count, 1);

  const second = await authedClient(customerC.token).post('/reviews', {
    shopId: reviewedShopId,
    rating: 2,
    reviewText: 'Not great',
  });
  assert.equal(second.status, 201);
  assert.equal(second.data.shop.rating, 3);
  assert.equal(second.data.shop.review_count, 2);

  const { rows: recomputed } = await app.pool.query(
    'SELECT rating, review_count FROM shops WHERE id = $1',
    [reviewedShopId]
  );
  assert.equal(recomputed[0].rating, 3);
  assert.equal(recomputed[0].review_count, 2);
});

test('one review per customer per shop is enforced (409)', async () => {
  const duplicate = await authedClient(customerA.token).post('/reviews', {
    shopId: reviewedShopId,
    rating: 5,
  });
  assert.equal(duplicate.status, 409);
});

test('hidden reviews are excluded from the aggregate recompute and public list', async () => {
  await app.pool.query(
    `INSERT INTO reviews (customer_id, shop_id, rating, status)
     VALUES ($1, $2, 5, 'hidden')`,
    [customerB.id, reviewedShopId]
  );
  const { rows } = await app.pool.query(
    'SELECT rating, review_count FROM shops WHERE id = $1',
    [reviewedShopId]
  );
  assert.equal(rows[0].rating, 3);
  assert.equal(rows[0].review_count, 2);

  const list = await makeClient(app.baseUrl).get(`/reviews?shopId=${reviewedShopId}`);
  assert.equal(list.status, 200);
  assert.equal(list.data.total, 2);
  assert.ok(list.data.reviews.every((r) => r.status === 'published'));
});

test('public shop review list is paginated and includes customer names', async () => {
  const page = await makeClient(app.baseUrl).get(`/reviews?shopId=${reviewedShopId}&limit=1`);
  assert.equal(page.status, 200);
  assert.equal(page.data.reviews.length, 1);
  assert.equal(page.data.total, 2);
  assert.ok(page.data.reviews[0].customer_name);

  const page2 = await makeClient(app.baseUrl).get(
    `/reviews?shopId=${reviewedShopId}&limit=1&offset=1`
  );
  assert.equal(page2.status, 200);
  assert.equal(page2.data.reviews.length, 1);
  assert.notEqual(page2.data.reviews[0].id, page.data.reviews[0].id);

  const unfiltered = await makeClient(app.baseUrl).get('/reviews');
  assert.equal(unfiltered.status, 200);
  assert.equal(unfiltered.data.total, 2);
});

test('GET /reviews/mine returns only the caller\'s reviews', async () => {
  const mine = await authedClient(customerA.token).get('/reviews/mine');
  assert.equal(mine.status, 200);
  assert.equal(mine.data.total, 1);
  assert.equal(mine.data.reviews[0].customer_id, customerA.id);
  assert.equal(mine.data.reviews[0].rating, 4);
  assert.equal(mine.data.reviews[0].shop_name, 'Reviewable Shop');

  const bobs = await authedClient(customerB.token).get('/reviews/mine');
  assert.equal(bobs.status, 200);
  assert.equal(bobs.data.total, 1);
  assert.equal(bobs.data.reviews[0].customer_id, customerB.id);
  assert.equal(bobs.data.reviews[0].status, 'hidden');
});

test('review reports: create (201), duplicate (409), self-report (403), missing (404)', async () => {
  const { rows } = await app.pool.query(
    'SELECT id FROM reviews WHERE customer_id = $1 AND shop_id = $2',
    [customerA.id, reviewedShopId]
  );
  const aliceReviewId = rows[0].id;

  const report = await authedClient(customerB.token).post(`/reviews/${aliceReviewId}/report`, {
    reason: 'This review looks fake',
  });
  assert.equal(report.status, 201);
  assert.equal(report.data.report.status, 'pending');
  assert.equal(report.data.report.review_id, aliceReviewId);

  const duplicate = await authedClient(customerB.token).post(`/reviews/${aliceReviewId}/report`, {
    reason: 'Reporting again',
  });
  assert.equal(duplicate.status, 409);

  const selfReport = await authedClient(customerA.token).post(`/reviews/${aliceReviewId}/report`, {
    reason: 'Reporting my own review',
  });
  assert.equal(selfReport.status, 403);

  const missing = await authedClient(customerB.token).post(
    '/reviews/00000000-0000-0000-0000-000000000002/report',
    { reason: 'Does not exist' }
  );
  assert.equal(missing.status, 404);
});

test('role and auth guards: merchants cannot review (403), anonymous cannot (401)', async () => {
  const asMerchant = await authedClient(merchant.token).post('/reviews', {
    shopId: reviewedShopId,
    rating: 5,
  });
  assert.equal(asMerchant.status, 403);

  const anonymous = await makeClient(app.baseUrl).post('/reviews', {
    shopId: reviewedShopId,
    rating: 5,
  });
  assert.equal(anonymous.status, 401);
});
