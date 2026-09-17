import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, seedAdmin, makeClient } from '../helpers/setup.js';

const DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/growlocal_test';
const TEST_ADMIN = { email: 'admin@test.local', password: 'Admin123!test' };

let app;

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();
  await seedAdmin(TEST_ADMIN);
});

test.after(async () => {
  await app.stop();
});

test('health endpoint responds', async () => {
  const response = await fetch(`${app.baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('customer signup issues tokens, sets refresh cookie, hides password_hash', async () => {
  const client = makeClient(app.baseUrl);
  const response = await client.post('/auth/customer/signup', {
    fullName: 'Test Customer',
    email: 'customer@test.local',
    password: 'Password123',
  });
  assert.equal(response.status, 201);
  assert.ok(response.data.accessToken);
  assert.equal(response.data.user.email, 'customer@test.local');
  assert.equal(response.data.user.full_name, 'Test Customer');
  assert.ok(!('password_hash' in response.data.user));
  assert.ok(response.setCookie.includes('gl_refresh_token='));
  assert.ok(response.setCookie.includes('HttpOnly'));
});

test('customer signup rejects duplicate email with 409', async () => {
  const client = makeClient(app.baseUrl);
  const body = { fullName: 'Dup Customer', email: 'dup@test.local', password: 'Password123' };
  const first = await client.post('/auth/customer/signup', body);
  assert.equal(first.status, 201);
  const second = await client.post('/auth/customer/signup', body);
  assert.equal(second.status, 409);
});

test('customer signup validates input with 400', async () => {
  const client = makeClient(app.baseUrl);
  const response = await client.post('/auth/customer/signup', {
    fullName: 'X',
    email: 'not-an-email',
    password: 'short',
  });
  assert.equal(response.status, 400);
  assert.equal(response.data.error.code, 'VALIDATION_ERROR');
});

test('customer login succeeds and /me returns the caller', async () => {
  const client = makeClient(app.baseUrl);
  await client.post('/auth/customer/signup', {
    fullName: 'Login Customer',
    email: 'login@test.local',
    password: 'Password123',
  });

  const login = await client.post('/auth/customer/login', {
    email: 'login@test.local',
    password: 'Password123',
  });
  assert.equal(login.status, 200);
  assert.ok(login.data.accessToken);
  client.setToken(login.data.accessToken);

  const me = await client.get('/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.data.user.email, 'login@test.local');
  assert.ok(!('password_hash' in me.data.user));
});

test('customer login with wrong password returns 401', async () => {
  const client = makeClient(app.baseUrl);
  const response = await client.post('/auth/customer/login', {
    email: 'login@test.local',
    password: 'WrongPassword1',
  });
  assert.equal(response.status, 401);
});

test('merchant signup + login work against the separate merchants table', async () => {
  const client = makeClient(app.baseUrl);
  const signup = await client.post('/auth/merchant/signup', {
    ownerName: 'Owner One',
    businessName: 'Test Shop Pvt',
    email: 'merchant@test.local',
    password: 'Password123',
    phone: '9876543210',
  });
  assert.equal(signup.status, 201);
  assert.equal(signup.data.user.verification_status, 'pending');

  const login = await client.post('/auth/merchant/login', {
    email: 'merchant@test.local',
    password: 'Password123',
  });
  assert.equal(login.status, 200);
  client.setToken(login.data.accessToken);
  const me = await client.get('/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.data.user.business_name, 'Test Shop Pvt');
});

test('admin login matches only seeded admins rows', async () => {
  const client = makeClient(app.baseUrl);
  const login = await client.post('/auth/admin/login', TEST_ADMIN);
  assert.equal(login.status, 200);
  assert.equal(login.data.user.role_name, 'super_admin');
  client.setToken(login.data.accessToken);
  const me = await client.get('/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.data.user.email, TEST_ADMIN.email);
});

test('refresh rotates the token; reuse of the old one is rejected', async () => {
  const client = makeClient(app.baseUrl);
  await client.post('/auth/customer/signup', {
    fullName: 'Refresh Customer',
    email: 'refresh@test.local',
    password: 'Password123',
  });

  const first = await client.post('/auth/refresh');
  assert.equal(first.status, 200);
  assert.ok(first.data.accessToken);

  const stolenCookie = client.getCookie();

  const second = await client.post('/auth/refresh');
  assert.equal(second.status, 200);
  assert.notEqual(client.getCookie(), stolenCookie);

  client.setCookie(stolenCookie);
  const replay = await client.post('/auth/refresh');
  assert.equal(replay.status, 401);
});

test('logout revokes the refresh token', async () => {
  const client = makeClient(app.baseUrl);
  await client.post('/auth/customer/signup', {
    fullName: 'Logout Customer',
    email: 'logout@test.local',
    password: 'Password123',
  });

  const refreshBefore = await client.post('/auth/refresh');
  assert.equal(refreshBefore.status, 200);

  const logout = await client.post('/auth/logout');
  assert.equal(logout.status, 204);
  assert.ok(/gl_refresh_token=;/.test(logout.setCookie || ''));

  const refreshAfter = await client.post('/auth/refresh');
  assert.equal(refreshAfter.status, 401);
});

test('protected endpoint without token returns 401', async () => {
  const client = makeClient(app.baseUrl);
  const response = await client.get('/auth/me');
  assert.equal(response.status, 401);
});

test('unknown API route returns 404 JSON error', async () => {
  const client = makeClient(app.baseUrl);
  const response = await client.get('/definitely-not-a-route');
  assert.equal(response.status, 404);
  assert.equal(response.data.error.code, 'NOT_FOUND');
});
