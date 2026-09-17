import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/growlocal_wc';

let app;
let customer;
let otherCustomer;
let merchant;
let shopIds = [];

function authedClient(token) {
  const client = makeClient(app.baseUrl);
  client.setToken(token);
  return client;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const client = makeClient(app.baseUrl);
  for (const [name, email] of [
    ['Saver One', 'saver-one@test.local'],
    ['Saver Two', 'saver-two@test.local'],
  ]) {
    const signup = await client.post('/auth/customer/signup', {
      fullName: name,
      email,
      password: 'Password123',
    });
    assert.equal(signup.status, 201);
    if (email.includes('one')) customer = { token: signup.data.accessToken, id: signup.data.user.id };
    if (email.includes('two')) otherCustomer = { token: signup.data.accessToken, id: signup.data.user.id };
  }

  const merchantSignup = await client.post('/auth/merchant/signup', {
    ownerName: 'Saved Owner',
    businessName: 'Saved Merchant Pvt',
    email: 'saved-merchant@test.local',
    password: 'Password123',
    phone: '9876543210',
  });
  assert.equal(merchantSignup.status, 201);
  merchant = { token: merchantSignup.data.accessToken, id: merchantSignup.data.user.id };

  const { rows } = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city)
     VALUES ($1, 'Saved Shop Alpha', '1 Test Street', 'Nagpur'),
            ($1, 'Saved Shop Beta', '2 Test Street', 'Nagpur'),
            ($1, 'Saved Shop Gamma', '3 Test Street', 'Nagpur')
     RETURNING id`,
    [merchant.id]
  );
  shopIds = rows.map((row) => row.id);
});

test.after(async () => {
  await app.stop();
});

test('customer saves a shop (201) and saving again is idempotent (200)', async () => {
  const client = authedClient(customer.token);
  const saved = await client.put(`/saved-shops/${shopIds[0]}`);
  assert.equal(saved.status, 201);
  assert.equal(saved.data.savedShop.customer_id, customer.id);
  assert.equal(saved.data.savedShop.shop_id, shopIds[0]);

  const again = await client.put(`/saved-shops/${shopIds[0]}`);
  assert.equal(again.status, 200);
  assert.equal(again.data.savedShop.id, saved.data.savedShop.id);

  const { rows } = await app.pool.query('SELECT COUNT(*)::int AS n FROM saved_shops');
  assert.equal(rows[0].n, 1);
});

test('saving a second shop and listing returns both, newest first, with shop details', async () => {
  const client = authedClient(customer.token);
  const second = await client.put(`/saved-shops/${shopIds[1]}`);
  assert.equal(second.status, 201);

  const list = await client.get('/saved-shops/mine');
  assert.equal(list.status, 200);
  assert.equal(list.data.total, 2);
  assert.equal(list.data.savedShops.length, 2);
  assert.equal(list.data.savedShops[0].shop_id, shopIds[1]);
  assert.equal(list.data.savedShops[0].name, 'Saved Shop Beta');
  assert.equal(list.data.savedShops[1].name, 'Saved Shop Alpha');
  assert.ok(list.data.savedShops[0].created_at >= list.data.savedShops[1].created_at);
});

test('saved shop lists are per-customer', async () => {
  await authedClient(otherCustomer.token).put(`/saved-shops/${shopIds[1]}`);
  const mine = await authedClient(customer.token).get('/saved-shops/mine');
  assert.equal(mine.data.total, 2);

  const theirs = await authedClient(otherCustomer.token).get('/saved-shops/mine');
  assert.equal(theirs.data.total, 1);
  assert.equal(theirs.data.savedShops[0].shop_id, shopIds[1]);
});

test('saved shop list is paginated', async () => {
  const page = await authedClient(customer.token).get('/saved-shops/mine?limit=1');
  assert.equal(page.status, 200);
  assert.equal(page.data.savedShops.length, 1);
  assert.equal(page.data.total, 2);

  const page2 = await authedClient(customer.token).get('/saved-shops/mine?limit=1&offset=1');
  assert.equal(page2.data.savedShops.length, 1);
  assert.notEqual(page2.data.savedShops[0].shop_id, page.data.savedShops[0].shop_id);
});

test('customer removes a saved shop (204); removing again is 404', async () => {
  const client = authedClient(customer.token);
  const removed = await client.delete(`/saved-shops/${shopIds[1]}`);
  assert.equal(removed.status, 204);

  const list = await client.get('/saved-shops/mine');
  assert.equal(list.data.total, 1);
  assert.equal(list.data.savedShops[0].shop_id, shopIds[0]);

  const again = await client.delete(`/saved-shops/${shopIds[1]}`);
  assert.equal(again.status, 404);
});

test('removing a shop that was never saved is 404; saving a nonexistent shop is 404', async () => {
  const client = authedClient(customer.token);
  const neverSaved = await client.delete(`/saved-shops/${shopIds[2]}`);
  assert.equal(neverSaved.status, 404);

  const missingShop = await client.put('/saved-shops/00000000-0000-0000-0000-000000000001');
  assert.equal(missingShop.status, 404);
});

test('invalid shopId in path returns 400', async () => {
  const response = await authedClient(customer.token).put('/saved-shops/not-a-uuid');
  assert.equal(response.status, 400);
});

test('role and auth guards: merchants cannot save (403), anonymous cannot list (401)', async () => {
  const asMerchant = await authedClient(merchant.token).put(`/saved-shops/${shopIds[2]}`);
  assert.equal(asMerchant.status, 403);

  const anonymous = await makeClient(app.baseUrl).get('/saved-shops/mine');
  assert.equal(anonymous.status, 401);
});
