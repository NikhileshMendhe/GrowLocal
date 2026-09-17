import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL = 'postgres://postgres:postgres@localhost:54322/growlocal_wd';
const PASSWORD = 'Password123';

let app;
let customerId;
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

  const customer = await app.pool.query(
    `INSERT INTO customers (full_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Customer One', 'customer-one@test.local', passwordHash, '9876512345']
  );
  customerId = customer.rows[0].id;

  await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5)`,
    ['Customer Test Biz', 'Owner C', 'customer-merchant@test.local', passwordHash, '9876500001']
  );

  for (const [role, path, email] of [
    ['customer', '/auth/customer/login', 'customer-one@test.local'],
    ['merchant', '/auth/merchant/login', 'customer-merchant@test.local'],
  ]) {
    const login = await makeClient(app.baseUrl).post(path, { email, password: PASSWORD });
    assert.equal(login.status, 200);
    tokens[role] = login.data.accessToken;
  }
});

test.after(async () => {
  await app.stop();
});

test('GET /customers/me without a token returns 401', async () => {
  const response = await makeClient(app.baseUrl).get('/customers/me');
  assert.equal(response.status, 401);
});

test('GET /customers/me returns the own profile without password_hash', async () => {
  const response = await clientAs('customer').get('/customers/me');
  assert.equal(response.status, 200);
  assert.equal(response.data.customer.id, customerId);
  assert.equal(response.data.customer.full_name, 'Customer One');
  assert.equal(response.data.customer.email, 'customer-one@test.local');
  assert.equal(response.data.customer.status, 'active');
  assert.ok(!('password_hash' in response.data.customer));
});

test('GET /customers/me rejects a merchant token with 403', async () => {
  const response = await clientAs('merchant').get('/customers/me');
  assert.equal(response.status, 403);
});

test('PATCH /customers/me updates name, phone and avatar', async () => {
  const response = await clientAs('customer').patch('/customers/me', {
    fullName: 'Customer Renamed',
    phone: '9999988888',
    avatarUrl: 'https://cdn.example.com/avatar.png',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.customer.full_name, 'Customer Renamed');
  assert.equal(response.data.customer.phone, '9999988888');
  assert.equal(response.data.customer.avatar_url, 'https://cdn.example.com/avatar.png');
});

test('PATCH /customers/me with an empty body returns 400', async () => {
  const response = await clientAs('customer').patch('/customers/me', {});
  assert.equal(response.status, 400);
});

test('PATCH /customers/me with an invalid field returns 400', async () => {
  const response = await clientAs('customer').patch('/customers/me', {
    locationId: 'not-a-uuid',
  });
  assert.equal(response.status, 400);
});

test('PATCH /customers/me ignores non-patchable fields (email, status)', async () => {
  const response = await clientAs('customer').patch('/customers/me', {
    fullName: 'Still Renamed',
    email: 'hacker@evil.test',
    status: 'blocked',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.customer.email, 'customer-one@test.local');
  assert.equal(response.data.customer.status, 'active');
});
