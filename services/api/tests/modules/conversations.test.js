import test from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';

import { startTestApp, truncateAll, makeClient } from '../helpers/setup.js';

const DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/growlocal_wc';

let app;
let customer;
let otherCustomer;
let merchant;
let shopId;
let otherMerchantShopId;

function authedClient(token) {
  const client = makeClient(app.baseUrl);
  client.setToken(token);
  return client;
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const socket = io(app.baseUrl, { auth: { token } });
    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', reject);
  });
}

function joinConversationRoom(socket, conversationId) {
  return new Promise((resolve, reject) => {
    socket.emit('conversation:join', conversationId, (ack) => {
      if (ack?.ok) resolve();
      else reject(new Error(`conversation:join failed: ${JSON.stringify(ack)}`));
    });
  });
}

function waitForEvent(socket, event, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out waiting for "${event}"`)),
      timeoutMs
    );
    socket.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  const customerClient = makeClient(app.baseUrl);
  const customerSignup = await customerClient.post('/auth/customer/signup', {
    fullName: 'Chat Customer',
    email: 'chat-customer@test.local',
    password: 'Password123',
  });
  assert.equal(customerSignup.status, 201);
  customer = { token: customerSignup.data.accessToken, id: customerSignup.data.user.id };

  const otherSignup = await customerClient.post('/auth/customer/signup', {
    fullName: 'Outsider Customer',
    email: 'outsider@test.local',
    password: 'Password123',
  });
  assert.equal(otherSignup.status, 201);
  otherCustomer = { token: otherSignup.data.accessToken, id: otherSignup.data.user.id };

  const merchantSignup = await customerClient.post('/auth/merchant/signup', {
    ownerName: 'Chat Owner',
    businessName: 'Chat Merchant Pvt',
    email: 'chat-merchant@test.local',
    password: 'Password123',
    phone: '9876543210',
  });
  assert.equal(merchantSignup.status, 201);
  merchant = { token: merchantSignup.data.accessToken, id: merchantSignup.data.user.id };

  const { rows: shopRows } = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city)
     VALUES ($1, 'Chat Corner Store', '1 Test Street', 'Nagpur')
     RETURNING id`,
    [merchant.id]
  );
  shopId = shopRows[0].id;

  const { rows: otherMerchantRows } = await app.pool.query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ('Other Merchant', 'Other Owner', 'other-merchant@test.local', 'x', '9999999999')
     RETURNING id`
  );
  const { rows: otherShopRows } = await app.pool.query(
    `INSERT INTO shops (merchant_id, name, address, city)
     VALUES ($1, 'Not Your Shop', '2 Test Street', 'Nagpur')
     RETURNING id`,
    [otherMerchantRows[0].id]
  );
  otherMerchantShopId = otherShopRows[0].id;
});

test.after(async () => {
  await app.stop();
});

test('customer creates a conversation for a shop (201), then get-or-create returns it (200)', async () => {
  const client = authedClient(customer.token);
  const created = await client.post('/conversations', { shopId });
  assert.equal(created.status, 201);
  assert.equal(created.data.conversation.customer_id, customer.id);
  assert.equal(created.data.conversation.merchant_id, merchant.id);
  assert.equal(created.data.conversation.shop_id, shopId);
  assert.equal(created.data.conversation.status, 'active');
  assert.equal(created.data.conversation.shop_name, 'Chat Corner Store');

  const again = await client.post('/conversations', { shopId });
  assert.equal(again.status, 200);
  assert.equal(again.data.conversation.id, created.data.conversation.id);

  const byMerchant = await authedClient(merchant.token).post('/conversations', {
    customerId: customer.id,
    shopId,
  });
  assert.equal(byMerchant.status, 200);
  assert.equal(byMerchant.data.conversation.id, created.data.conversation.id);
});

test('merchant cannot start a conversation for a shop they do not own (404)', async () => {
  const response = await authedClient(merchant.token).post('/conversations', {
    customerId: customer.id,
    shopId: otherMerchantShopId,
  });
  assert.equal(response.status, 404);
});

test('merchant must provide customerId when starting a conversation (400)', async () => {
  const response = await authedClient(merchant.token).post('/conversations', { shopId });
  assert.equal(response.status, 400);
});

test('conversation creation for a nonexistent shop returns 404', async () => {
  const response = await authedClient(customer.token).post('/conversations', {
    shopId: '00000000-0000-0000-0000-000000000001',
  });
  assert.equal(response.status, 404);
});

test('both customer and merchant socket clients receive MESSAGE_CREATED when a message is posted via the API', async () => {
  const list = await authedClient(customer.token).get('/conversations');
  assert.equal(list.status, 200);
  const conversation = list.data.conversations[0];

  const customerSocket = await connectSocket(customer.token);
  const merchantSocket = await connectSocket(merchant.token);
  try {
    await joinConversationRoom(customerSocket, conversation.id);
    await joinConversationRoom(merchantSocket, conversation.id);

    const customerEvent = waitForEvent(customerSocket, 'message:created');
    const merchantEvent = waitForEvent(merchantSocket, 'message:created');

    const posted = await authedClient(customer.token).post(
      `/conversations/${conversation.id}/messages`,
      { messageText: 'Hello from the customer' }
    );
    assert.equal(posted.status, 201);
    assert.equal(posted.data.message.message_text, 'Hello from the customer');
    assert.equal(posted.data.message.sender_type, 'customer');

    const [customerPayload, merchantPayload] = await Promise.all([customerEvent, merchantEvent]);
    for (const payload of [customerPayload, merchantPayload]) {
      assert.equal(payload.conversation_id, conversation.id);
      assert.equal(payload.message_text, 'Hello from the customer');
      assert.equal(payload.sender_type, 'customer');
      assert.equal(payload.id, posted.data.message.id);
    }

    const merchantReplyEvent = waitForEvent(customerSocket, 'message:created');
    const merchantReplySeenByMerchant = waitForEvent(merchantSocket, 'message:created');
    const merchantReply = await authedClient(merchant.token).post(
      `/conversations/${conversation.id}/messages`,
      { messageText: 'Hello from the merchant' }
    );
    assert.equal(merchantReply.status, 201);
    assert.equal(merchantReply.data.message.sender_type, 'merchant');

    const replyPayload = await merchantReplyEvent;
    assert.equal(replyPayload.message_text, 'Hello from the merchant');
    assert.equal(replyPayload.sender_type, 'merchant');
    await merchantReplySeenByMerchant;
  } finally {
    customerSocket.disconnect();
    merchantSocket.disconnect();
  }
});

test('non-participant cannot join the conversation room over the socket', async () => {
  const list = await authedClient(customer.token).get('/conversations');
  const conversation = list.data.conversations[0];
  const socket = await connectSocket(otherCustomer.token);
  try {
    const ack = await new Promise((resolve) => {
      socket.emit('conversation:join', conversation.id, resolve);
    });
    assert.equal(ack.ok, false);
  } finally {
    socket.disconnect();
  }
});

test('list conversations shows the thread to both participants with unread counts', async () => {
  const asCustomer = await authedClient(customer.token).get('/conversations');
  assert.equal(asCustomer.status, 200);
  assert.equal(asCustomer.data.total, 1);
  assert.equal(asCustomer.data.conversations[0].shop_name, 'Chat Corner Store');
  assert.equal(asCustomer.data.conversations[0].customer_name, 'Chat Customer');
  assert.equal(asCustomer.data.conversations[0].merchant_name, 'Chat Merchant Pvt');
  assert.equal(asCustomer.data.conversations[0].last_message_text, 'Hello from the merchant');
  assert.equal(asCustomer.data.conversations[0].unread_count, 1);

  const asMerchant = await authedClient(merchant.token).get('/conversations');
  assert.equal(asMerchant.status, 200);
  assert.equal(asMerchant.data.total, 1);
  assert.equal(asMerchant.data.conversations[0].id, asCustomer.data.conversations[0].id);
  assert.ok(asMerchant.data.conversations[0].unread_count >= 1);

  const asOutsider = await authedClient(otherCustomer.token).get('/conversations');
  assert.equal(asOutsider.status, 200);
  assert.equal(asOutsider.data.total, 0);
});

test('GET /conversations/:id returns detail to participants (403/404 otherwise)', async () => {
  const list = await authedClient(customer.token).get('/conversations');
  const conversation = list.data.conversations[0];

  const asCustomer = await authedClient(customer.token).get(`/conversations/${conversation.id}`);
  assert.equal(asCustomer.status, 200);
  assert.equal(asCustomer.data.conversation.id, conversation.id);

  const asMerchant = await authedClient(merchant.token).get(`/conversations/${conversation.id}`);
  assert.equal(asMerchant.status, 200);

  const asOutsider = await authedClient(otherCustomer.token).get(`/conversations/${conversation.id}`);
  assert.equal(asOutsider.status, 403);

  const missing = await authedClient(customer.token).get(
    '/conversations/00000000-0000-0000-0000-000000000002'
  );
  assert.equal(missing.status, 403);
});

test('messages are listed newest-first and paginated', async () => {
  const list = await authedClient(customer.token).get('/conversations');
  const conversation = list.data.conversations[0];

  const all = await authedClient(customer.token).get(`/conversations/${conversation.id}/messages`);
  assert.equal(all.status, 200);
  assert.ok(all.data.total >= 2);
  assert.equal(all.data.messages.length, all.data.total);
  for (let i = 1; i < all.data.messages.length; i += 1) {
    assert.ok(new Date(all.data.messages[i - 1].created_at) >= new Date(all.data.messages[i].created_at));
  }

  const page = await authedClient(customer.token).get(
    `/conversations/${conversation.id}/messages?limit=1`
  );
  assert.equal(page.status, 200);
  assert.equal(page.data.messages.length, 1);
  assert.equal(page.data.total, all.data.total);
  assert.equal(page.data.messages[0].id, all.data.messages[0].id);

  const page2 = await authedClient(customer.token).get(
    `/conversations/${conversation.id}/messages?limit=1&offset=1`
  );
  assert.equal(page2.status, 200);
  assert.equal(page2.data.messages[0].id, all.data.messages[1].id);

  const asOutsider = await authedClient(otherCustomer.token).get(
    `/conversations/${conversation.id}/messages`
  );
  assert.equal(asOutsider.status, 403);
});

test('posting a message as a non-participant is rejected (403); image messages carry attachments', async () => {
  const list = await authedClient(customer.token).get('/conversations');
  const conversation = list.data.conversations[0];

  const asOutsider = await authedClient(otherCustomer.token).post(
    `/conversations/${conversation.id}/messages`,
    { messageText: 'let me in' }
  );
  assert.equal(asOutsider.status, 403);

  const image = await authedClient(customer.token).post(
    `/conversations/${conversation.id}/messages`,
    {
      messageText: 'photo of the product',
      messageType: 'image',
      attachmentUrl: 'https://cdn.example.com/photo.jpg',
    }
  );
  assert.equal(image.status, 201);
  assert.equal(image.data.message.message_type, 'image');
  assert.equal(image.data.message.attachment_url, 'https://cdn.example.com/photo.jpg');
});

test('validation errors return 400', async () => {
  const client = authedClient(customer.token);
  const empty = await client.post(`/conversations/${shopId}/messages`, { messageText: '' });
  assert.equal(empty.status, 400);
  const badType = await client.post(`/conversations/${shopId}/messages`, {
    messageText: 'x',
    messageType: 'video',
  });
  assert.equal(badType.status, 400);
});

test('unauthenticated access is rejected (401)', async () => {
  const response = await makeClient(app.baseUrl).get('/conversations');
  assert.equal(response.status, 401);
});
