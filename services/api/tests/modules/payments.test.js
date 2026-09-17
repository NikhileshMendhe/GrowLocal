import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL = 'postgres://postgres:postgres@localhost:54322/growlocal_wd';
const PASSWORD = 'Password123';

let app;
let merchantId;
let otherMerchantId;
let customerId;
let otherCustomerId;
let orderId;
let otherCustomerOrderId;
let subscriptionId;
let otherMerchantSubscriptionId;
let campaignId;
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

  const merchant = await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['Payments Biz', 'Pay Owner', 'pay-merchant@test.local', passwordHash, '9876543202']
  );
  merchantId = merchant.rows[0].id;

  const otherMerchant = await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['Other Payments Biz', 'Other Owner', 'pay-merchant-2@test.local', passwordHash, '9876543203']
  );
  otherMerchantId = otherMerchant.rows[0].id;

  const customer = await app.pool.query(
    `INSERT INTO customers (full_name, email, password_hash)
     VALUES ($1, $2, $3) RETURNING id`,
    ['Pay Customer', 'pay-customer@test.local', passwordHash]
  );
  customerId = customer.rows[0].id;

  const otherCustomer = await app.pool.query(
    `INSERT INTO customers (full_name, email, password_hash)
     VALUES ($1, $2, $3) RETURNING id`,
    ['Other Pay Customer', 'pay-customer-2@test.local', passwordHash]
  );
  otherCustomerId = otherCustomer.rows[0].id;

  const shop = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city) VALUES ($1, $2, $3, $4) RETURNING id`,
    [merchantId, 'Pay Shop', '1 Pay Street', 'Nagpur']
  );
  const product = await app.pool.query(
    `INSERT INTO products (shop_id, name, price) VALUES ($1, $2, $3) RETURNING id`,
    [shop.rows[0].id, 'Pay Product', 500]
  );

  const order = await app.pool.query(
    `INSERT INTO orders (order_code, customer_id, shop_id, merchant_id, product_id,
                          quantity, unit_price, total_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    ['GL-ORD-PAY-1', customerId, shop.rows[0].id, merchantId, product.rows[0].id, 1, 500, 500]
  );
  orderId = order.rows[0].id;

  const otherCustomerOrder = await app.pool.query(
    `INSERT INTO orders (order_code, customer_id, shop_id, merchant_id, product_id,
                          quantity, unit_price, total_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    ['GL-ORD-PAY-2', otherCustomerId, shop.rows[0].id, merchantId, product.rows[0].id, 1, 500, 500]
  );
  otherCustomerOrderId = otherCustomerOrder.rows[0].id;

  const plan = await app.pool.query(
    `INSERT INTO subscription_plans (name, price, billing_interval)
     VALUES ($1, $2, $3) RETURNING id`,
    ['Pay Plan', 299, 'month']
  );
  const subscription = await app.pool.query(
    `INSERT INTO merchant_subscriptions (merchant_id, plan_id, status)
     VALUES ($1, $2, 'active') RETURNING id`,
    [merchantId, plan.rows[0].id]
  );
  subscriptionId = subscription.rows[0].id;

  const otherMerchantSubscription = await app.pool.query(
    `INSERT INTO merchant_subscriptions (merchant_id, plan_id, status)
     VALUES ($1, $2, 'active') RETURNING id`,
    [otherMerchantId, plan.rows[0].id]
  );
  otherMerchantSubscriptionId = otherMerchantSubscription.rows[0].id;

  const campaign = await app.pool.query(
    `INSERT INTO campaigns (merchant_id, name, budget) VALUES ($1, $2, $3) RETURNING id`,
    [merchantId, 'Pay Campaign', 5000]
  );
  campaignId = campaign.rows[0].id;

  for (const [role, path, email] of [
    ['merchant', '/auth/merchant/login', 'pay-merchant@test.local'],
    ['customer', '/auth/customer/login', 'pay-customer@test.local'],
  ]) {
    const login = await makeClient(app.baseUrl).post(path, { email, password: PASSWORD });
    assert.equal(login.status, 200);
    tokens[role] = login.data.accessToken;
  }
});

test.after(async () => {
  await app.stop();
});

test('POST /payments as a customer records an order payment', async () => {
  const response = await clientAs('customer').post('/payments', {
    paymentType: 'order',
    amount: 500,
    orderId,
    status: 'successful',
    gatewayPaymentId: 'pay_test_123',
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.payment.customer_id, customerId);
  assert.equal(response.data.payment.merchant_id, null);
  assert.equal(response.data.payment.order_id, orderId);
  assert.equal(response.data.payment.amount, 500);
  assert.equal(response.data.payment.currency, 'INR');
  assert.equal(response.data.payment.status, 'successful');
  assert.equal(response.data.payment.gateway_payment_id, 'pay_test_123');
});

test('POST /payments as a customer cannot reference someone else order (403)', async () => {
  const response = await clientAs('customer').post('/payments', {
    paymentType: 'order',
    amount: 100,
    orderId: otherCustomerOrderId,
  });
  assert.equal(response.status, 403);
});

test('POST /payments as a merchant records a subscription payment', async () => {
  const response = await clientAs('merchant').post('/payments', {
    paymentType: 'subscription',
    amount: 299,
    subscriptionId,
    status: 'successful',
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.payment.merchant_id, merchantId);
  assert.equal(response.data.payment.customer_id, null);
  assert.equal(response.data.payment.subscription_id, subscriptionId);
});

test('POST /payments as a merchant records a campaign payment', async () => {
  const response = await clientAs('merchant').post('/payments', {
    paymentType: 'campaign',
    amount: 1500,
    campaignId,
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.payment.campaign_id, campaignId);
  assert.equal(response.data.payment.status, 'pending');
});

test('POST /payments rejects another merchant subscription (403)', async () => {
  const response = await clientAs('merchant').post('/payments', {
    paymentType: 'subscription',
    amount: 299,
    subscriptionId: otherMerchantSubscriptionId,
  });
  assert.equal(response.status, 403);
});

test('POST /payments rejects a customer referencing a subscription (403)', async () => {
  const response = await clientAs('customer').post('/payments', {
    paymentType: 'subscription',
    amount: 299,
    subscriptionId,
  });
  assert.equal(response.status, 403);
});

test('POST /payments with an unknown reference returns 404', async () => {
  const response = await clientAs('customer').post('/payments', {
    paymentType: 'order',
    amount: 10,
    orderId: '1b671a5e-5f78-4c30-8e1a-951f8c1e0000',
  });
  assert.equal(response.status, 404);
});

test('POST /payments with an invalid amount returns 400', async () => {
  const response = await clientAs('customer').post('/payments', {
    paymentType: 'order',
    amount: -5,
  });
  assert.equal(response.status, 400);
});

test('POST /payments with two references returns 400', async () => {
  const response = await clientAs('merchant').post('/payments', {
    paymentType: 'mixed',
    amount: 100,
    subscriptionId,
    campaignId,
  });
  assert.equal(response.status, 400);
});

test('GET /payments/mine lists the caller own payments', async () => {
  const customerResponse = await clientAs('customer').get('/payments/mine');
  assert.equal(customerResponse.status, 200);
  assert.ok(customerResponse.data.total >= 1);
  assert.ok(customerResponse.data.payments.every((p) => p.customer_id === customerId));

  const merchantResponse = await clientAs('merchant').get('/payments/mine');
  assert.equal(merchantResponse.status, 200);
  assert.ok(merchantResponse.data.total >= 2);
  assert.ok(merchantResponse.data.payments.every((p) => p.merchant_id === merchantId));
});

test('GET /payments/mine without a token returns 401', async () => {
  const response = await makeClient(app.baseUrl).get('/payments/mine');
  assert.equal(response.status, 401);
});
