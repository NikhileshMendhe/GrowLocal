import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL = 'postgres://postgres:postgres@localhost:54322/growlocal_wd';
const PASSWORD = 'Password123';

let app;
let merchantAId;
let merchantBId;
let approvedCreatorId;
let pendingCreatorId;
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

  const merchantA = await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['Campaigns Biz A', 'Owner CA', 'campaign-a@test.local', passwordHash, '9876543204']
  );
  merchantAId = merchantA.rows[0].id;

  const merchantB = await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['Campaigns Biz B', 'Owner CB', 'campaign-b@test.local', passwordHash, '9876543205']
  );
  merchantBId = merchantB.rows[0].id;

  await app.pool.query(
    `INSERT INTO customers (full_name, email, password_hash)
     VALUES ($1, $2, $3)`,
    ['Campaign Customer', 'campaign-customer@test.local', passwordHash]
  );

  const approvedCreator = await app.pool.query(
    `INSERT INTO creators (name, category, followers, status)
     VALUES ($1, $2, $3, 'approved') RETURNING id`,
    ['Campaign Creator', 'fashion', '80K']
  );
  approvedCreatorId = approvedCreator.rows[0].id;

  const pendingCreator = await app.pool.query(
    `INSERT INTO creators (name, category, followers, status)
     VALUES ($1, $2, $3, 'pending') RETURNING id`,
    ['Campaign Pending Creator', 'food', '8K']
  );
  pendingCreatorId = pendingCreator.rows[0].id;

  for (const [role, path, email] of [
    ['merchantA', '/auth/merchant/login', 'campaign-a@test.local'],
    ['merchantB', '/auth/merchant/login', 'campaign-b@test.local'],
    ['customer', '/auth/customer/login', 'campaign-customer@test.local'],
  ]) {
    const login = await makeClient(app.baseUrl).post(path, { email, password: PASSWORD });
    assert.equal(login.status, 200);
    tokens[role] = login.data.accessToken;
  }
});

test.after(async () => {
  await app.stop();
});

test('POST /campaigns creates a draft campaign for the merchant', async () => {
  const response = await clientAs('merchantA').post('/campaigns', {
    name: 'Diwali Push',
    description: 'Festive collaboration',
    budget: 25000,
    startDate: '2026-10-01',
    endDate: '2026-11-01',
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.campaign.merchant_id, merchantAId);
  assert.equal(response.data.campaign.status, 'draft');
  assert.equal(response.data.campaign.budget, 25000);
  campaignId = response.data.campaign.id;
});

test('POST /campaigns with a missing budget returns 400', async () => {
  const response = await clientAs('merchantA').post('/campaigns', {
    name: 'No Budget Campaign',
  });
  assert.equal(response.status, 400);
});

test('POST /campaigns with reversed dates returns 400', async () => {
  const response = await clientAs('merchantA').post('/campaigns', {
    name: 'Reversed Dates',
    budget: 1000,
    startDate: '2026-11-01',
    endDate: '2026-10-01',
  });
  assert.equal(response.status, 400);
});

test('POST /campaigns rejects a customer token with 403', async () => {
  const response = await clientAs('customer').post('/campaigns', {
    name: 'Customer Campaign',
    budget: 100,
  });
  assert.equal(response.status, 403);
});

test('GET /campaigns/mine lists only the caller own campaigns', async () => {
  const response = await clientAs('merchantA').get('/campaigns/mine');
  assert.equal(response.status, 200);
  assert.equal(response.data.total, 1);
  assert.equal(response.data.campaigns[0].id, campaignId);

  const other = await clientAs('merchantB').get('/campaigns/mine');
  assert.equal(other.status, 200);
  assert.equal(other.data.total, 0);
});

test('GET /campaigns/:id returns the campaign to its owner', async () => {
  const response = await clientAs('merchantA').get(`/campaigns/${campaignId}`);
  assert.equal(response.status, 200);
  assert.equal(response.data.campaign.id, campaignId);
  assert.equal(response.data.campaign.name, 'Diwali Push');
});

test('GET /campaigns/:id hides another merchant campaign with 403', async () => {
  const response = await clientAs('merchantB').get(`/campaigns/${campaignId}`);
  assert.equal(response.status, 403);
});

test('GET /campaigns/:id with an unknown id returns 404', async () => {
  const response = await clientAs('merchantA').get('/campaigns/1b671a5e-5f78-4c30-8e1a-951f8c1e0000');
  assert.equal(response.status, 404);
});

test('POST /campaigns/:id/creators adds an approved creator', async () => {
  const response = await clientAs('merchantA').post(`/campaigns/${campaignId}/creators`, {
    creatorId: approvedCreatorId,
    agreedAmount: 5000,
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.campaignCreator.campaign_id, campaignId);
  assert.equal(response.data.campaignCreator.creator_id, approvedCreatorId);
  assert.equal(response.data.campaignCreator.status, 'accepted');
  assert.equal(response.data.campaignCreator.agreed_amount, 5000);
});

test('POST /campaigns/:id/creators rejects a duplicate creator with 409', async () => {
  const response = await clientAs('merchantA').post(`/campaigns/${campaignId}/creators`, {
    creatorId: approvedCreatorId,
  });
  assert.equal(response.status, 409);
});

test('POST /campaigns/:id/creators rejects a pending creator with 400', async () => {
  const response = await clientAs('merchantA').post(`/campaigns/${campaignId}/creators`, {
    creatorId: pendingCreatorId,
  });
  assert.equal(response.status, 400);
});

test('POST /campaigns/:id/creators with an unknown creator returns 404', async () => {
  const response = await clientAs('merchantA').post(`/campaigns/${campaignId}/creators`, {
    creatorId: '1b671a5e-5f78-4c30-8e1a-951f8c1e0000',
  });
  assert.equal(response.status, 404);
});

test('POST /campaigns/:id/creators rejects a non-owner with 403', async () => {
  const response = await clientAs('merchantB').post(`/campaigns/${campaignId}/creators`, {
    creatorId: approvedCreatorId,
  });
  assert.equal(response.status, 403);
});

test('GET /campaigns/:id/creators lists the campaign creators with their profile', async () => {
  const response = await clientAs('merchantA').get(`/campaigns/${campaignId}/creators`);
  assert.equal(response.status, 200);
  assert.equal(response.data.creators.length, 1);
  assert.equal(response.data.creators[0].creator_id, approvedCreatorId);
  assert.equal(response.data.creators[0].creator_name, 'Campaign Creator');
});

test('GET /campaigns/:id/metrics returns recorded metrics per creator', async () => {
  await app.pool.query(
    `INSERT INTO campaign_metrics (campaign_id, creator_id, reach, clicks, enquiries, orders, visits)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [campaignId, approvedCreatorId, 15000, 900, 40, 12, 300]
  );

  const response = await clientAs('merchantA').get(`/campaigns/${campaignId}/metrics`);
  assert.equal(response.status, 200);
  assert.equal(response.data.metrics.length, 1);
  assert.equal(response.data.metrics[0].creator_id, approvedCreatorId);
  assert.equal(response.data.metrics[0].creator_name, 'Campaign Creator');
  assert.equal(response.data.metrics[0].reach, 15000);
  assert.equal(response.data.metrics[0].orders, 12);
});

test('GET /campaigns/:id/metrics rejects a non-owner with 403', async () => {
  const response = await clientAs('merchantB').get(`/campaigns/${campaignId}/metrics`);
  assert.equal(response.status, 403);
});
