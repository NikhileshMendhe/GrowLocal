import test from 'node:test';
import assert from 'node:assert/strict';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL = 'postgres://postgres:postgres@localhost:54322/growlocal_wd';
const PASSWORD = 'Password123';

let app;
let merchantToken;

test.before(async () => {
  // The uploads module must see the S3 vars as unset so presign returns 503.
  delete process.env.S3_ENDPOINT;
  delete process.env.S3_REGION;
  delete process.env.S3_ACCESS_KEY_ID;
  delete process.env.S3_SECRET_ACCESS_KEY;
  delete process.env.S3_BUCKET_PREFIX;

  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const { hashPassword } = await import('../../src/utils/password.js');
  const passwordHash = await hashPassword(PASSWORD);

  await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5)`,
    ['Uploads Biz', 'Upload Owner', 'uploads-merchant@test.local', passwordHash, '9876543299']
  );

  const login = await makeClient(app.baseUrl).post('/auth/merchant/login', {
    email: 'uploads-merchant@test.local',
    password: PASSWORD,
  });
  assert.equal(login.status, 200);
  merchantToken = login.data.accessToken;
});

test.after(async () => {
  await app.stop();
});

test('POST /uploads/presign returns 503 UPLOADS_NOT_CONFIGURED when S3 env is unset', async () => {
  const client = makeClient(app.baseUrl);
  client.setToken(merchantToken);
  const response = await client.post('/uploads/presign', {
    filename: 'product.png',
    contentType: 'image/png',
  });
  assert.equal(response.status, 503);
  assert.equal(response.data.error.code, 'UPLOADS_NOT_CONFIGURED');
});

test('POST /uploads/presign without a token returns 401', async () => {
  const response = await makeClient(app.baseUrl).post('/uploads/presign', {
    filename: 'product.png',
    contentType: 'image/png',
  });
  assert.equal(response.status, 401);
});

test('POST /uploads/presign with an invalid body returns 400', async () => {
  const client = makeClient(app.baseUrl);
  client.setToken(merchantToken);
  const response = await client.post('/uploads/presign', {
    filename: '',
    contentType: 'not-a-mime',
  });
  assert.equal(response.status, 400);
});

test('POST /uploads/presign with an unknown bucket returns 400', async () => {
  const client = makeClient(app.baseUrl);
  client.setToken(merchantToken);
  const response = await client.post('/uploads/presign', {
    filename: 'product.png',
    contentType: 'image/png',
    bucket: 'not-a-bucket',
  });
  assert.equal(response.status, 400);
});
