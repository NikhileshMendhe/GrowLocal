import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL = 'postgres://postgres:postgres@localhost:54322/growlocal_wd';
const PASSWORD = 'Password123';

let app;
let basicPlanId;
let premiumPlanId;
let tokens = {};

function clientAs(role) {
  const client = makeClient(app.baseUrl);
  client.setToken(tokens[role]);
  return client;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const { hashPassword } = await import('../../src/utils/password.js');
  const passwordHash = await hashPassword(PASSWORD);

  await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5)`,
    ['Subscriptions Biz', 'Sub Owner', 'subs-merchant@test.local', passwordHash, '9876543201']
  );
  await app.pool.query(
    `INSERT INTO customers (full_name, email, password_hash)
     VALUES ($1, $2, $3)`,
    ['Subs Customer', 'subs-customer@test.local', passwordHash]
  );

  const basic = await app.pool.query(
    `INSERT INTO subscription_plans (name, price, billing_interval, features)
     VALUES ($1, $2, $3, $4::jsonb) RETURNING id`,
    ['Basic', 299, 'month', JSON.stringify(['List products', 'Basic analytics'])]
  );
  basicPlanId = basic.rows[0].id;

  const premium = await app.pool.query(
    `INSERT INTO subscription_plans (name, price, billing_interval, features)
     VALUES ($1, $2, $3, $4::jsonb) RETURNING id`,
    ['Premium', 999, 'month', JSON.stringify(['Everything in Basic', 'Featured placement'])]
  );
  premiumPlanId = premium.rows[0].id;

  await app.pool.query(
    `INSERT INTO subscription_plans (name, price, billing_interval, features, is_active)
     VALUES ($1, $2, $3, $4::jsonb, FALSE)`,
    ['Retired', 100, 'month', JSON.stringify([])]
  );

  for (const [role, path, email] of [
    ['merchant', '/auth/merchant/login', 'subs-merchant@test.local'],
    ['customer', '/auth/customer/login', 'subs-customer@test.local'],
  ]) {
    const login = await makeClient(app.baseUrl).post(path, { email, password: PASSWORD });
    assert.equal(login.status, 200);
    tokens[role] = login.data.accessToken;
  }
});

test.after(async () => {
  await app.stop();
});

test('GET /subscriptions/plans lists active plans publicly, cheapest first', async () => {
  const response = await makeClient(app.baseUrl).get('/subscriptions/plans');
  assert.equal(response.status, 200);
  assert.equal(response.data.total, 2);
  assert.deepEqual(
    response.data.plans.map((plan) => plan.name),
    ['Basic', 'Premium']
  );
  assert.equal(response.data.plans[0].price, 299);
  assert.ok(Array.isArray(response.data.plans[0].features));
});

test('GET /subscriptions/plans supports pagination', async () => {
  const response = await makeClient(app.baseUrl).get('/subscriptions/plans?limit=1&offset=1');
  assert.equal(response.status, 200);
  assert.equal(response.data.plans.length, 1);
  assert.equal(response.data.plans[0].name, 'Premium');
});

test('GET /subscriptions/me returns null subscription before subscribing', async () => {
  const response = await clientAs('merchant').get('/subscriptions/me');
  assert.equal(response.status, 200);
  assert.equal(response.data.subscription, null);
});

test('GET /subscriptions/me rejects a customer token with 403', async () => {
  const response = await clientAs('customer').get('/subscriptions/me');
  assert.equal(response.status, 403);
});

test('POST /subscriptions subscribes the merchant to a plan', async () => {
  const response = await clientAs('merchant').post('/subscriptions', { planId: basicPlanId });
  assert.equal(response.status, 201);
  assert.equal(response.data.subscription.status, 'active');
  assert.equal(response.data.subscription.plan.name, 'Basic');
  assert.equal(response.data.subscription.plan.price, 299);
  assert.ok(new Date(response.data.subscription.expires_at) > new Date());
});

test('GET /subscriptions/me returns the current subscription with its plan', async () => {
  const response = await clientAs('merchant').get('/subscriptions/me');
  assert.equal(response.status, 200);
  assert.equal(response.data.subscription.status, 'active');
  assert.equal(response.data.subscription.plan_id, basicPlanId);
  assert.equal(response.data.subscription.plan.name, 'Basic');
});

test('POST /subscriptions again cancels the previous subscription atomically', async () => {
  const response = await clientAs('merchant').post('/subscriptions', { planId: premiumPlanId });
  assert.equal(response.status, 201);
  assert.equal(response.data.subscription.plan_id, premiumPlanId);

  const { rows } = await app.pool.query(
    `SELECT status FROM merchant_subscriptions ORDER BY created_at ASC`
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].status, 'cancelled');
  assert.equal(rows[1].status, 'active');
});

test('POST /subscriptions with an unknown planId returns 404', async () => {
  const response = await clientAs('merchant').post('/subscriptions', {
    planId: '1b671a5e-5f78-4c30-8e1a-951f8c1e0000',
  });
  assert.equal(response.status, 404);
});

test('POST /subscriptions with an inactive plan returns 400', async () => {
  const { rows } = await app.pool.query(
    `SELECT id FROM subscription_plans WHERE name = 'Retired'`
  );
  const response = await clientAs('merchant').post('/subscriptions', { planId: rows[0].id });
  assert.equal(response.status, 400);
});

test('POST /subscriptions with an invalid body returns 400', async () => {
  const response = await clientAs('merchant').post('/subscriptions', { planId: 'nope' });
  assert.equal(response.status, 400);
});

test('POST /subscriptions rejects a customer token with 403', async () => {
  const response = await clientAs('customer').post('/subscriptions', { planId: basicPlanId });
  assert.equal(response.status, 403);
});
