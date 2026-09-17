import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll } from '../helpers/setup.js';

const DATABASE_URL = 'postgres://postgres:postgres@localhost:54322/growlocal_wd';

let app;
let approvedCreatorId;
let otherApprovedCreatorId;
let pendingCreatorId;

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const approved = await app.pool.query(
    `INSERT INTO creators (name, bio, category, followers, engagement_rate, status, social_links)
     VALUES ($1, $2, $3, $4, $5, 'approved', $6::jsonb) RETURNING id`,
    ['Approved Creator', 'Fashion and lifestyle', 'fashion', '50K', '4.5%', JSON.stringify({ instagram: 'https://instagram.com/approved' })]
  );
  approvedCreatorId = approved.rows[0].id;

  const otherApproved = await app.pool.query(
    `INSERT INTO creators (name, bio, category, followers, engagement_rate, status)
     VALUES ($1, $2, $3, $4, $5, 'approved') RETURNING id`,
    ['Tech Creator', 'Gadgets and reviews', 'electronics', '120K', '6.2%']
  );
  otherApprovedCreatorId = otherApproved.rows[0].id;

  const pending = await app.pool.query(
    `INSERT INTO creators (name, bio, category, followers, status)
     VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
    ['Pending Creator', 'Waiting for review', 'food', '10K']
  );
  pendingCreatorId = pending.rows[0].id;
});

test.after(async () => {
  await app.stop();
});

test('GET /creators lists only approved creators, publicly', async () => {
  const response = await fetch(`${app.baseUrl}/api/creators`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.total, 2);
  const ids = data.creators.map((creator) => creator.id);
  assert.ok(ids.includes(approvedCreatorId));
  assert.ok(ids.includes(otherApprovedCreatorId));
  assert.ok(!ids.includes(pendingCreatorId));
});

test('GET /creators filters by category', async () => {
  const response = await fetch(`${app.baseUrl}/api/creators?category=fashion`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.total, 1);
  assert.equal(data.creators[0].id, approvedCreatorId);
});

test('GET /creators filters by name search', async () => {
  const response = await fetch(`${app.baseUrl}/api/creators?q=tech`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.total, 1);
  assert.equal(data.creators[0].id, otherApprovedCreatorId);
});

test('GET /creators paginates', async () => {
  const response = await fetch(`${app.baseUrl}/api/creators?limit=1&offset=1`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.total, 2);
  assert.equal(data.creators.length, 1);
});

test('GET /creators/:id returns an approved creator', async () => {
  const response = await fetch(`${app.baseUrl}/api/creators/${approvedCreatorId}`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.creator.id, approvedCreatorId);
  assert.equal(data.creator.name, 'Approved Creator');
  assert.equal(data.creator.status, 'approved');
  assert.equal(data.creator.social_links.instagram, 'https://instagram.com/approved');
});

test('GET /creators/:id hides a pending creator with 404', async () => {
  const response = await fetch(`${app.baseUrl}/api/creators/${pendingCreatorId}`);
  assert.equal(response.status, 404);
});

test('GET /creators/:id with an unknown id returns 404', async () => {
  const response = await fetch(`${app.baseUrl}/api/creators/1b671a5e-5f78-4c30-8e1a-951f8c1e0000`);
  assert.equal(response.status, 404);
});
