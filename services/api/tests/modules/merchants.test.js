import test from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL = 'postgres://postgres:postgres@localhost:54322/growlocal_wd';
const PASSWORD = 'Password123';

let app;
let passwordHash;
let merchantAId;
let shopId;
let tokens = {};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function once(emitter, event, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timed out waiting for '${event}'`)),
      timeoutMs
    );
    emitter.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

function clientAs(role) {
  const client = makeClient(app.baseUrl);
  client.setToken(tokens[role]);
  return client;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const { hashPassword } = await import('../../src/utils/password.js');
  passwordHash = await hashPassword(PASSWORD);

  const merchantA = await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['Merchant A Biz', 'Owner A', 'merchant-a@test.local', passwordHash, '9876543210']
  );
  merchantAId = merchantA.rows[0].id;

  await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5)`,
    ['Merchant B Biz', 'Owner B', 'merchant-b@test.local', passwordHash, '9876500000']
  );

  await app.pool.query(
    `INSERT INTO customers (full_name, email, password_hash)
     VALUES ($1, $2, $3)`,
    ['Customer A', 'customer-a@test.local', passwordHash]
  );

  const shop = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city, description, phone)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [merchantAId, 'Shop Alpha', '12 Test Street', 'Nagpur', 'Original description', '9812345678']
  );
  shopId = shop.rows[0].id;

  // One login per role, reused by every test (auth is rate-limited).
  for (const [role, path, email] of [
    ['merchantA', '/auth/merchant/login', 'merchant-a@test.local'],
    ['merchantB', '/auth/merchant/login', 'merchant-b@test.local'],
    ['customer', '/auth/customer/login', 'customer-a@test.local'],
  ]) {
    const login = await makeClient(app.baseUrl).post(path, { email, password: PASSWORD });
    assert.equal(login.status, 200);
    tokens[role] = login.data.accessToken;
  }
});

test.after(async () => {
  await app.stop();
});

test('GET /merchants/me without a token returns 401', async () => {
  const response = await makeClient(app.baseUrl).get('/merchants/me');
  assert.equal(response.status, 401);
});

test('GET /merchants/me returns the own business profile without password_hash', async () => {
  const response = await clientAs('merchantA').get('/merchants/me');
  assert.equal(response.status, 200);
  assert.equal(response.data.merchant.id, merchantAId);
  assert.equal(response.data.merchant.business_name, 'Merchant A Biz');
  assert.equal(response.data.merchant.verification_status, 'pending');
  assert.ok(!('password_hash' in response.data.merchant));
});

test('GET /merchants/me rejects a customer token with 403', async () => {
  const response = await clientAs('customer').get('/merchants/me');
  assert.equal(response.status, 403);
});

test('PATCH /merchants/me updates business profile fields', async () => {
  const response = await clientAs('merchantA').patch('/merchants/me', {
    businessName: 'Merchant A Renamed',
    businessDescription: 'We sell tested things',
    gstin: '27AAAPL1234C1ZV',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.merchant.business_name, 'Merchant A Renamed');
  assert.equal(response.data.merchant.business_description, 'We sell tested things');
  assert.equal(response.data.merchant.gstin, '27AAAPL1234C1ZV');
  assert.equal(response.data.merchant.email, 'merchant-a@test.local');
});

test('PATCH /merchants/me with an empty body returns 400', async () => {
  const response = await clientAs('merchantA').patch('/merchants/me', {});
  assert.equal(response.status, 400);
});

test('PATCH /merchants/me with an invalid field returns 400', async () => {
  const response = await clientAs('merchantA').patch('/merchants/me', { phone: '123' });
  assert.equal(response.status, 400);
});

test('GET /merchants/me/shop returns the merchant own shop', async () => {
  const response = await clientAs('merchantA').get('/merchants/me/shop');
  assert.equal(response.status, 200);
  assert.equal(response.data.shop.id, shopId);
  assert.equal(response.data.shop.name, 'Shop Alpha');
  assert.equal(response.data.shop.merchant_id, merchantAId);
});

test('GET /merchants/me/shop returns 404 when the merchant has no shop', async () => {
  const response = await clientAs('merchantB').get('/merchants/me/shop');
  assert.equal(response.status, 404);
});

test('PATCH /merchants/me/shop updates shop fields', async () => {
  const response = await clientAs('merchantA').patch('/merchants/me/shop', {
    description: 'Patched description',
    phone: '9898989898',
    pincode: '440010',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.shop.id, shopId);
  assert.equal(response.data.shop.description, 'Patched description');
  assert.equal(response.data.shop.phone, '9898989898');
  assert.equal(response.data.shop.pincode, '440010');
});

test('PATCH /merchants/me/shop rejects the admin-only status with 400', async () => {
  const response = await clientAs('merchantA').patch('/merchants/me/shop', { status: 'suspended' });
  assert.equal(response.status, 400);
});

test('PATCH /merchants/me/shop emits SHOP_UPDATED to the shop room after commit', async () => {
  // §7.5: a merchant socket is auto-joined to shop:{id} for shops they own.
  const socket = io(app.baseUrl, { auth: { token: tokens.merchantA } });
  try {
    await once(socket, 'connect');
    await delay(300);

    const eventPromise = once(socket, 'shop:updated');
    const response = await clientAs('merchantA').patch('/merchants/me/shop', {
      description: 'Socket-pushed description',
    });
    assert.equal(response.status, 200);

    const payload = await eventPromise;
    assert.equal(payload.id, shopId);
    assert.equal(payload.description, 'Socket-pushed description');
  } finally {
    socket.close();
  }
});

test('SHOP_UPDATED is scoped to the shop room, not the catalog room', async () => {
  // Merchant B owns no shop, so its socket sits only in the public catalog
  // room — the emit must not reach it there.
  const socket = io(app.baseUrl, { auth: { token: tokens.merchantB } });
  try {
    await once(socket, 'connect');
    await delay(300);

    let received = false;
    socket.on('shop:updated', () => {
      received = true;
    });

    const response = await clientAs('merchantA').patch('/merchants/me/shop', {
      description: 'Private to shop room',
    });
    assert.equal(response.status, 200);
    await delay(500);
    assert.equal(received, false);
  } finally {
    socket.close();
  }
});
