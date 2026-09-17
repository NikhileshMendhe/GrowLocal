import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL = 'postgres://postgres:postgres@localhost:54322/growlocal_wd';
const PASSWORD = 'Password123';

let app;
let adminToken;
let merchantToken;
let adminId;
let merchantId;
let customerId;
let shopId;
let productId;
let verificationId;

function adminClient() {
  const client = makeClient(app.baseUrl);
  client.setToken(adminToken);
  return client;
}

function merchantClient() {
  const client = makeClient(app.baseUrl);
  client.setToken(merchantToken);
  return client;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const { hashPassword } = await import('../../src/utils/password.js');
  const passwordHash = await hashPassword(PASSWORD);

  // Admins are never self-registered — create the fixture the way the seed does (§5).
  const admin = await app.pool.query(
    `INSERT INTO admins (full_name, email, password_hash, role_name)
     VALUES ($1, $2, $3, 'super_admin') RETURNING id`,
    ['Admin Fixture', 'admin-fixture@test.local', passwordHash]
  );
  adminId = admin.rows[0].id;

  const merchant = await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['Admin Biz', 'Admin Owner', 'admin-merchant@test.local', passwordHash, '9876543206']
  );
  merchantId = merchant.rows[0].id;

  const customer = await app.pool.query(
    `INSERT INTO customers (full_name, email, password_hash)
     VALUES ($1, $2, $3) RETURNING id`,
    ['Admin Customer', 'admin-customer@test.local', passwordHash]
  );
  customerId = customer.rows[0].id;

  const shop = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city) VALUES ($1, $2, $3, $4) RETURNING id`,
    [merchantId, 'Admin Shop', '9 Admin Road', 'Nagpur']
  );
  shopId = shop.rows[0].id;

  const product = await app.pool.query(
    `INSERT INTO products (shop_id, name, price, approval_status)
     VALUES ($1, $2, $3, 'pending') RETURNING id`,
    [shopId, 'Admin Product', 750]
  );
  productId = product.rows[0].id;

  const verification = await app.pool.query(
    `INSERT INTO shop_verifications (shop_id, merchant_id) VALUES ($1, $2) RETURNING id`,
    [shopId, merchantId]
  );
  verificationId = verification.rows[0].id;

  const adminLogin = await makeClient(app.baseUrl).post('/auth/admin/login', {
    email: 'admin-fixture@test.local',
    password: PASSWORD,
  });
  assert.equal(adminLogin.status, 200);
  adminToken = adminLogin.data.accessToken;

  const merchantLogin = await makeClient(app.baseUrl).post('/auth/merchant/login', {
    email: 'admin-merchant@test.local',
    password: PASSWORD,
  });
  assert.equal(merchantLogin.status, 200);
  merchantToken = merchantLogin.data.accessToken;
});

test.after(async () => {
  await app.stop();
});

test('GET /admin/dashboard without a token returns 401', async () => {
  const response = await makeClient(app.baseUrl).get('/admin/dashboard');
  assert.equal(response.status, 401);
});

test('GET /admin/dashboard rejects a non-admin token with 403', async () => {
  const response = await merchantClient().get('/admin/dashboard');
  assert.equal(response.status, 403);
});

test('GET /admin/dashboard returns aggregate counts', async () => {
  const response = await adminClient().get('/admin/dashboard');
  assert.equal(response.status, 200);
  const counts = response.data.counts;
  assert.equal(counts.customers, 1);
  assert.equal(counts.merchants, 1);
  assert.equal(counts.shops, 1);
  assert.equal(counts.products, 1);
  assert.equal(counts.pending_products, 1);
  assert.equal(counts.pending_shop_verifications, 1);
  assert.ok(Array.isArray(response.data.recentActivity));
});

test('PATCH /admin/products/:id/approval approves a product', async () => {
  const response = await adminClient().patch(`/admin/products/${productId}/approval`, {
    approvalStatus: 'approved',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.product.id, productId);
  assert.equal(response.data.product.approval_status, 'approved');
});

test('PATCH /admin/products/:id/approval rejects a non-admin with 403', async () => {
  const response = await merchantClient().patch(`/admin/products/${productId}/approval`, {
    approvalStatus: 'rejected',
  });
  assert.equal(response.status, 403);
});

test('PATCH /admin/products/:id/approval with an invalid status returns 400', async () => {
  const response = await adminClient().patch(`/admin/products/${productId}/approval`, {
    approvalStatus: 'not-a-status',
  });
  assert.equal(response.status, 400);
});

test('PATCH /admin/products/:id/approval with an unknown id returns 404', async () => {
  const response = await adminClient().patch(
    '/admin/products/1b671a5e-5f78-4c30-8e1a-951f8c1e0000/approval',
    { approvalStatus: 'approved' }
  );
  assert.equal(response.status, 404);
});

test('GET /admin/audit-logs is paginated and contains the approval audit row', async () => {
  const response = await adminClient().get('/admin/audit-logs');
  assert.equal(response.status, 200);
  assert.ok(response.data.total >= 1);
  assert.ok(Array.isArray(response.data.auditLogs));
  const approval = response.data.auditLogs.find(
    (log) => log.action === 'product.approval_updated' && log.entity_id === productId
  );
  assert.ok(approval, 'expected a product.approval_updated audit row');
  assert.equal(approval.admin_id, adminId);
  assert.deepEqual(approval.old_data, { approval_status: 'pending' });
  assert.deepEqual(approval.new_data, { approval_status: 'approved' });

  const paged = await adminClient().get('/admin/audit-logs?limit=1');
  assert.equal(paged.status, 200);
  assert.equal(paged.data.auditLogs.length, 1);
});

test('PATCH /admin/shops/:id/status suspends a shop and audits it', async () => {
  const response = await adminClient().patch(`/admin/shops/${shopId}/status`, {
    status: 'suspended',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.shop.id, shopId);
  assert.equal(response.data.shop.status, 'suspended');

  const logs = await adminClient().get('/admin/audit-logs');
  const audit = logs.data.auditLogs.find(
    (log) => log.action === 'shop.status_updated' && log.entity_id === shopId
  );
  assert.ok(audit);
  assert.deepEqual(audit.old_data, { status: 'open' });
  assert.deepEqual(audit.new_data, { status: 'suspended' });
});

test('PATCH /admin/shops/:id/status with an invalid status returns 400', async () => {
  const response = await adminClient().patch(`/admin/shops/${shopId}/status`, {
    status: 'banned',
  });
  assert.equal(response.status, 400);
});

test('PATCH /admin/merchants/:id/status suspends a merchant', async () => {
  const response = await adminClient().patch(`/admin/merchants/${merchantId}/status`, {
    status: 'suspended',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.merchant.id, merchantId);
  assert.equal(response.data.merchant.status, 'suspended');
});

test('PATCH /admin/customers/:id/status blocks a customer', async () => {
  const response = await adminClient().patch(`/admin/customers/${customerId}/status`, {
    status: 'blocked',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.customer.id, customerId);
  assert.equal(response.data.customer.status, 'blocked');
});

test('PATCH /admin/shop-verifications/:id approves a verification and flips the shop', async () => {
  const response = await adminClient().patch(`/admin/shop-verifications/${verificationId}`, {
    status: 'approved',
    verificationNotes: 'Documents verified',
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.verification.id, verificationId);
  assert.equal(response.data.verification.status, 'approved');
  assert.equal(response.data.verification.reviewed_by, adminId);
  assert.ok(response.data.verification.reviewed_at);

  // §3.2 trigger: approving flips shops.is_verified and merchants.verification_status.
  const shop = await app.pool.query('SELECT is_verified FROM shops WHERE id = $1', [shopId]);
  assert.equal(shop.rows[0].is_verified, true);
  const merchant = await app.pool.query(
    'SELECT verification_status FROM merchants WHERE id = $1',
    [merchantId]
  );
  assert.equal(merchant.rows[0].verification_status, 'approved');
});

test('PATCH /admin/shop-verifications/:id rejects an invalid status with 400', async () => {
  const response = await adminClient().patch(`/admin/shop-verifications/${verificationId}`, {
    status: 'maybe',
  });
  assert.equal(response.status, 400);
});

test('GET /admin/shops lists shops with their merchant', async () => {
  const response = await adminClient().get('/admin/shops');
  assert.equal(response.status, 200);
  assert.ok(response.data.total >= 1);
  const shop = response.data.shops.find((row) => row.id === shopId);
  assert.ok(shop);
  assert.equal(shop.merchant_business_name, 'Admin Biz');
  assert.equal(shop.status, 'suspended');
});

test('GET /admin/shops filters by status', async () => {
  const response = await adminClient().get('/admin/shops?status=suspended');
  assert.equal(response.status, 200);
  assert.ok(response.data.shops.every((row) => row.status === 'suspended'));
});

test('GET /admin/merchants lists merchants', async () => {
  const response = await adminClient().get('/admin/merchants');
  assert.equal(response.status, 200);
  assert.ok(response.data.total >= 1);
  const merchant = response.data.merchants.find((row) => row.id === merchantId);
  assert.equal(merchant.status, 'suspended');
});

test('GET /admin/customers lists customers', async () => {
  const response = await adminClient().get('/admin/customers');
  assert.equal(response.status, 200);
  assert.ok(response.data.total >= 1);
});

test('GET /admin/products lists products', async () => {
  const response = await adminClient().get('/admin/products');
  assert.equal(response.status, 200);
  assert.ok(response.data.total >= 1);
  const product = response.data.products.find((row) => row.id === productId);
  assert.equal(product.shop_name, 'Admin Shop');
  assert.equal(product.approval_status, 'approved');
});

test('GET /admin/products filters by approvalStatus', async () => {
  const response = await adminClient().get('/admin/products?approvalStatus=pending');
  assert.equal(response.status, 200);
  assert.equal(
    response.data.products.every((row) => row.approval_status === 'pending'),
    true
  );
});

test('GET /admin/shop-verifications lists verifications with shop and merchant', async () => {
  const response = await adminClient().get('/admin/shop-verifications');
  assert.equal(response.status, 200);
  assert.ok(response.data.total >= 1);
  const verification = response.data.verifications.find((row) => row.id === verificationId);
  assert.ok(verification);
  assert.equal(verification.shop_name, 'Admin Shop');
  assert.equal(verification.merchant_business_name, 'Admin Biz');
});

test('GET /admin/dashboard surfaces recent activity after mutations', async () => {
  const response = await adminClient().get('/admin/dashboard');
  assert.equal(response.status, 200);
  assert.ok(response.data.recentActivity.length >= 1);
  assert.ok(
    response.data.recentActivity.every((log) => log.action && log.created_at)
  );
});
