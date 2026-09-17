import test from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';

import { startTestApp, truncateAll, makeClient, seedAdmin } from '../helpers/setup.js';

const DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/growlocal_wa';

let app;
let EVENTS;
let anon;
let merchantA;
let merchantB;
let customer;
let admin;
let fx;
let insertMerchant;
let insertShop;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out waiting for ${label}`)), ms);
    timer.unref();
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function loginMerchant(email) {
  const client = makeClient(app.baseUrl);
  const login = await client.post('/auth/merchant/login', { email, password: 'Password123' });
  assert.equal(login.status, 200);
  client.setToken(login.data.accessToken);
  client.accessToken = login.data.accessToken;
  return client;
}

test.before(async () => {
  app = await startTestApp({ databaseUrl: DATABASE_URL });
  await truncateAll();

  EVENTS = (await import('../../src/realtime/events.js')).EVENTS;
  const { hashPassword } = await import('../../src/utils/password.js');
  const passwordHash = await hashPassword('Password123');

  insertMerchant = async (email, businessName) => {
    const { rows } = await app.pool.query(
      `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone, status, verification_status)
       VALUES ($1, $2, $3, $4, $5, 'active', 'approved') RETURNING id`,
      [businessName, 'Fixture Owner', email, passwordHash, '9876543210']
    );
    return rows[0].id;
  };

  insertShop = async (merchantId, name, status, overrides = {}) => {
    const { rows } = await app.pool.query(
      `INSERT INTO shops (merchant_id, name, description, category_id, address, city, state, pincode, latitude, longitude, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Maharashtra', '440001', $7, $8, $9)
       RETURNING id, name, city, status`,
      [
        merchantId,
        name,
        overrides.description ?? null,
        overrides.categoryId ?? null,
        overrides.address ?? '1 Test Street',
        overrides.city ?? 'Nagpur',
        overrides.lat ?? 21.1458,
        overrides.lng ?? 79.0882,
        status,
      ]
    );
    return rows[0];
  };

  const insertProduct = async (shopId, name, overrides) => {
    const { rows } = await app.pool.query(
      `INSERT INTO products (shop_id, category_id, name, slug, description, price, original_price,
         availability_status, stock_quantity, is_featured, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        shopId,
        overrides.categoryId ?? null,
        name,
        overrides.slug,
        overrides.description ?? null,
        overrides.price ?? 100,
        overrides.originalPrice ?? null,
        overrides.availabilityStatus ?? 'In Stock',
        overrides.stockQuantity ?? 10,
        overrides.isFeatured ?? false,
        overrides.approvalStatus ?? 'approved',
      ]
    );
    return rows[0].id;
  };

  const { rows: categoryRows } = await app.pool.query(
    `INSERT INTO categories (name, slug) VALUES ('Fixture Electronics', 'fixture-electronics')
       RETURNING id, slug`
  );
  const category = categoryRows[0];

  const merchantAId = await insertMerchant('merchant-a@wa.test', 'Alpha Retail');
  const merchantBId = await insertMerchant('merchant-b@wa.test', 'Beta Retail');

  const shopA1 = await insertShop(merchantAId, 'Alpha Electronics', 'open', {
    categoryId: category.id,
    description: 'Gadgets and accessories',
  });
  const shopA2 = await insertShop(merchantAId, 'Alpha Underground', 'suspended', {
    categoryId: category.id,
  });
  const shopB1 = await insertShop(merchantBId, 'Beta Books Pune', 'open', {
    city: 'Pune',
    lat: 18.5204,
    lng: 73.8567,
  });

  await app.pool.query(
    `INSERT INTO shop_hours (shop_id, day_of_week, opening_time, closing_time, is_open)
     VALUES ($1, 'Monday', '09:00', '18:00', TRUE), ($1, 'Tuesday', '10:00', '19:00', TRUE)`,
    [shopA1.id]
  );
  await app.pool.query(
    `INSERT INTO shop_photos (shop_id, image_url, caption, display_order)
     VALUES ($1, 'https://cdn.test/alpha-front.jpg', 'Front', 0),
            ($1, 'https://cdn.test/alpha-inside.jpg', 'Inside', 1)`,
    [shopA1.id]
  );

  fx = {
    category,
    shopA1,
    shopA2,
    shopB1,
    mouseId: await insertProduct(shopA1.id, 'Wireless Mouse', {
      categoryId: category.id,
      price: 100,
      slug: 'wireless-mouse',
    }),
    pendingCableId: await insertProduct(shopA1.id, 'HDMI Cable', {
      categoryId: category.id,
      price: 50,
      approvalStatus: 'pending',
      slug: 'hdmi-cable',
    }),
    keyboardId: await insertProduct(shopA1.id, 'Mechanical Keyboard', {
      categoryId: category.id,
      price: 500,
      slug: 'mechanical-keyboard',
    }),
    suspendedShopProductId: await insertProduct(shopA2.id, 'Grey Market Drone', {
      categoryId: category.id,
      price: 75,
      slug: 'grey-market-drone',
    }),
    betaNovelId: await insertProduct(shopB1.id, 'Beta Bestseller Novel', {
      price: 200,
      slug: 'beta-bestseller-novel',
    }),
    betaHiddenId: await insertProduct(shopB1.id, 'Hidden Diary', {
      price: 30,
      approvalStatus: 'hidden',
      slug: 'hidden-diary',
    }),
  };

  anon = makeClient(app.baseUrl);

  merchantA = makeClient(app.baseUrl);
  const loginA = await merchantA.post('/auth/merchant/login', {
    email: 'merchant-a@wa.test',
    password: 'Password123',
  });
  assert.equal(loginA.status, 200);
  merchantA.setToken(loginA.data.accessToken);

  merchantB = makeClient(app.baseUrl);
  const loginB = await merchantB.post('/auth/merchant/login', {
    email: 'merchant-b@wa.test',
    password: 'Password123',
  });
  assert.equal(loginB.status, 200);
  merchantB.setToken(loginB.data.accessToken);

  customer = makeClient(app.baseUrl);
  const signup = await customer.post('/auth/customer/signup', {
    fullName: 'Fixture Customer',
    email: 'customer@wa.test',
    password: 'Password123',
  });
  assert.equal(signup.status, 201);
  customer.setToken(signup.data.accessToken);

  // Admins are never self-registered — create the fixture the way the seed
  // does, then log in through the admin-only auth path (§5).
  await seedAdmin({ email: 'admin@wa.test', password: 'Password123' });
  admin = makeClient(app.baseUrl);
  const adminLogin = await admin.post('/auth/admin/login', {
    email: 'admin@wa.test',
    password: 'Password123',
  });
  assert.equal(adminLogin.status, 200);
  admin.setToken(adminLogin.data.accessToken);
});

test.after(async () => {
  await app.stop();
});

test('GET /shops lists only publicly visible shops', async () => {
  const res = await anon.get('/shops');
  assert.equal(res.status, 200);
  assert.deepEqual(
    new Set(res.data.shops.map((s) => s.id)),
    new Set([fx.shopA1.id, fx.shopB1.id])
  );
  assert.equal(res.data.total, 2);
  assert.equal(res.data.limit, 20);
  assert.equal(res.data.offset, 0);
  for (const shop of res.data.shops) {
    assert.notEqual(shop.status, 'suspended');
  }
});

test('GET /shops filters by city case-insensitively', async () => {
  const res = await anon.get('/shops?city=nagpur');
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.data.shops.map((s) => s.id),
    [fx.shopA1.id]
  );
});

test('GET /shops filters by search query', async () => {
  const res = await anon.get('/shops?q=alpha');
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.data.shops.map((s) => s.id),
    [fx.shopA1.id]
  );
});

test('GET /shops filters by category slug and uuid', async () => {
  const bySlug = await anon.get(`/shops?category=${fx.category.slug}`);
  assert.equal(bySlug.status, 200);
  assert.deepEqual(
    bySlug.data.shops.map((s) => s.id),
    [fx.shopA1.id]
  );

  const byUuid = await anon.get(`/shops?category=${fx.category.id}`);
  assert.equal(byUuid.status, 200);
  assert.deepEqual(
    byUuid.data.shops.map((s) => s.id),
    [fx.shopA1.id]
  );
});

test('GET /shops paginates with limit and offset', async () => {
  const first = await anon.get('/shops?limit=1&offset=0');
  assert.equal(first.status, 200);
  assert.equal(first.data.shops.length, 1);
  assert.equal(first.data.total, 2);

  const second = await anon.get('/shops?limit=1&offset=1');
  assert.equal(second.status, 200);
  assert.equal(second.data.shops.length, 1);

  assert.notEqual(first.data.shops[0].id, second.data.shops[0].id);
});

test('GET /shops filters by geo radius and sorts by distance', async () => {
  const near = await anon.get('/shops?lat=21.1458&lng=79.0882&radiusKm=50');
  assert.equal(near.status, 200);
  assert.deepEqual(
    near.data.shops.map((s) => s.id),
    [fx.shopA1.id]
  );

  const wide = await anon.get('/shops?lat=21.1458&lng=79.0882&radiusKm=1000');
  assert.equal(wide.status, 200);
  assert.equal(wide.data.shops.length, 2);
  assert.equal(wide.data.shops[0].id, fx.shopA1.id);
});

test('GET /shops/:id returns detail including hours and photos', async () => {
  const res = await anon.get(`/shops/${fx.shopA1.id}`);
  assert.equal(res.status, 200);
  assert.equal(res.data.shop.id, fx.shopA1.id);
  assert.equal(res.data.shop.name, 'Alpha Electronics');
  assert.equal(res.data.shop.category_name, 'Fixture Electronics');
  assert.equal(res.data.shop.status, 'open');
  assert.equal(res.data.shop.hours.length, 2);
  assert.equal(res.data.shop.hours[0].day_of_week, 'Monday');
  assert.equal(res.data.shop.hours[0].opening_time, '09:00:00');
  assert.equal(res.data.shop.photos.length, 2);
  assert.equal(res.data.shop.photos[0].image_url, 'https://cdn.test/alpha-front.jpg');
});

test('GET /shops/:id returns 404 for a suspended shop', async () => {
  const res = await anon.get(`/shops/${fx.shopA2.id}`);
  assert.equal(res.status, 404);
  assert.equal(res.data.error.code, 'NOT_FOUND');
});

test('GET /shops/:id rejects a non-uuid id with 400', async () => {
  const res = await anon.get('/shops/not-a-uuid');
  assert.equal(res.status, 400);
  assert.equal(res.data.error.code, 'VALIDATION_ERROR');
});

test('GET /shops/:id/products lists only approved products of a visible shop', async () => {
  const res = await anon.get(`/shops/${fx.shopA1.id}/products`);
  assert.equal(res.status, 200);
  assert.deepEqual(
    new Set(res.data.products.map((p) => p.id)),
    new Set([fx.mouseId, fx.keyboardId])
  );
  assert.equal(res.data.total, 2);
});

test('GET /shops/:id/products returns 404 for a suspended shop', async () => {
  const res = await anon.get(`/shops/${fx.shopA2.id}/products`);
  assert.equal(res.status, 404);
});

test('GET /shops/:id/products supports query and price filters', async () => {
  const byQuery = await anon.get(`/shops/${fx.shopA1.id}/products?q=mouse`);
  assert.equal(byQuery.status, 200);
  assert.deepEqual(
    byQuery.data.products.map((p) => p.id),
    [fx.mouseId]
  );

  const byPrice = await anon.get(`/shops/${fx.shopA1.id}/products?maxPrice=200`);
  assert.equal(byPrice.status, 200);
  assert.deepEqual(
    byPrice.data.products.map((p) => p.id),
    [fx.mouseId]
  );
});

test('GET /products lists approved products of visible shops only', async () => {
  const res = await anon.get('/products');
  assert.equal(res.status, 200);
  assert.deepEqual(
    new Set(res.data.products.map((p) => p.id)),
    new Set([fx.mouseId, fx.keyboardId, fx.betaNovelId])
  );
  assert.equal(res.data.total, 3);
});

test('GET /products filters by shopId hiding unapproved rows', async () => {
  const res = await anon.get(`/products?shopId=${fx.shopA1.id}`);
  assert.equal(res.status, 200);
  assert.deepEqual(
    new Set(res.data.products.map((p) => p.id)),
    new Set([fx.mouseId, fx.keyboardId])
  );
});

test('GET /products filters by search query', async () => {
  const res = await anon.get('/products?q=keyboard');
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.data.products.map((p) => p.id),
    [fx.keyboardId]
  );
});

test('GET /products filters by price range', async () => {
  const mid = await anon.get('/products?minPrice=60&maxPrice=250');
  assert.equal(mid.status, 200);
  assert.deepEqual(
    new Set(mid.data.products.map((p) => p.id)),
    new Set([fx.mouseId, fx.betaNovelId])
  );

  const high = await anon.get('/products?minPrice=300');
  assert.equal(high.status, 200);
  assert.deepEqual(
    new Set(high.data.products.map((p) => p.id)),
    new Set([fx.keyboardId])
  );
});

test('GET /products/:id returns an approved product with shop info', async () => {
  const res = await anon.get(`/products/${fx.mouseId}`);
  assert.equal(res.status, 200);
  assert.equal(res.data.product.id, fx.mouseId);
  assert.equal(res.data.product.name, 'Wireless Mouse');
  assert.equal(res.data.product.price, 100);
  assert.equal(res.data.product.shop_name, 'Alpha Electronics');
  assert.equal(res.data.product.approval_status, 'approved');
});

test('GET /products/:id returns 404 for a pending product', async () => {
  const res = await anon.get(`/products/${fx.pendingCableId}`);
  assert.equal(res.status, 404);
});

test('GET /products/:id returns 404 for a product in a suspended shop', async () => {
  const res = await anon.get(`/products/${fx.suspendedShopProductId}`);
  assert.equal(res.status, 404);
});

test('GET /products/:id rejects a non-uuid id with 400', async () => {
  const res = await anon.get('/products/nope');
  assert.equal(res.status, 400);
  assert.equal(res.data.error.code, 'VALIDATION_ERROR');
});

test('POST /products requires a bearer token', async () => {
  const res = await anon.post('/products', {
    shopId: fx.shopA1.id,
    name: 'No Auth Lamp',
    price: 10,
  });
  assert.equal(res.status, 401);
});

test('POST /products rejects a customer token with 403', async () => {
  const res = await customer.post('/products', {
    shopId: fx.shopA1.id,
    name: 'Customer Lamp',
    price: 10,
  });
  assert.equal(res.status, 403);
});

test('POST /products creates a product immediately visible to the public', async () => {
  const res = await merchantA.post('/products', {
    shopId: fx.shopA1.id,
    categoryId: fx.category.id,
    name: 'Merchant Created Lamp',
    description: 'A lamp created through the API',
    price: 250,
    originalPrice: 500,
    stockQuantity: 7,
  });
  assert.equal(res.status, 201);
  fx.lampId = res.data.product.id;
  assert.equal(res.data.product.approval_status, 'approved');
  assert.equal(res.data.product.discount_percentage, 50);
  assert.equal(res.data.product.stock_quantity, 7);
  assert.equal(res.data.product.availability_status, 'In Stock');
  assert.match(res.data.product.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);

  const publicList = await anon.get(`/shops/${fx.shopA1.id}/products`);
  assert.ok(publicList.data.products.some((p) => p.id === fx.lampId));
});

test('POST /products returns 403 for another merchant shop', async () => {
  const res = await merchantA.post('/products', {
    shopId: fx.shopB1.id,
    name: 'Cross Shop Item',
    price: 10,
  });
  assert.equal(res.status, 403);
});

test('POST /products returns 403 for an unknown shop', async () => {
  const res = await merchantA.post('/products', {
    shopId: '00000000-0000-0000-0000-000000000001',
    name: 'Ghost Item',
    price: 10,
  });
  assert.equal(res.status, 403);
});

test('POST /products validates the body with 400', async () => {
  const res = await merchantA.post('/products', {
    shopId: fx.shopA1.id,
    name: 'X',
    price: -5,
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.error.code, 'VALIDATION_ERROR');
});

test('GET /products as a merchant returns own products across shops, any status', async () => {
  const res = await merchantA.get('/products');
  assert.equal(res.status, 200);
  assert.deepEqual(
    new Set(res.data.products.map((p) => p.id)),
    new Set([
      fx.mouseId,
      fx.pendingCableId,
      fx.keyboardId,
      fx.suspendedShopProductId,
      fx.lampId,
    ])
  );
});

test('GET /products as a merchant scopes to the given own shop', async () => {
  const res = await merchantA.get(`/products?shopId=${fx.shopA2.id}`);
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.data.products.map((p) => p.id),
    [fx.suspendedShopProductId]
  );
});

test('GET /products as a merchant returns 403 for a foreign shopId', async () => {
  const res = await merchantA.get(`/products?shopId=${fx.shopB1.id}`);
  assert.equal(res.status, 403);
});

test('GET /products/:id as owner returns an unapproved product', async () => {
  const res = await merchantA.get(`/products/${fx.pendingCableId}`);
  assert.equal(res.status, 200);
  assert.equal(res.data.product.approval_status, 'pending');
});

test('GET /products/:id as non-owner returns 404 for another shop hidden product', async () => {
  const res = await merchantA.get(`/products/${fx.betaHiddenId}`);
  assert.equal(res.status, 404);
});

test('PUT /products/:id updates fields and recomputes the discount', async () => {
  const res = await merchantA.put(`/products/${fx.lampId}`, {
    name: 'Merchant Created Lamp v2',
    price: 300,
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.product.name, 'Merchant Created Lamp v2');
  assert.equal(res.data.product.price, 300);
  assert.equal(res.data.product.discount_percentage, 40);
});

test('PATCH /products/:id updates fields too', async () => {
  const res = await merchantA.patch(`/products/${fx.lampId}`, {
    description: 'Patched description',
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.product.description, 'Patched description');
});

test('PUT /products/:id returns 403 for another merchant product', async () => {
  const res = await merchantA.put(`/products/${fx.betaNovelId}`, { price: 1 });
  assert.equal(res.status, 403);
});

test('PUT /products/:id returns 404 for an unknown product', async () => {
  const res = await merchantA.put('/products/00000000-0000-0000-0000-000000000002', {
    price: 1,
  });
  assert.equal(res.status, 404);
});

test('PUT /products/:id requires a bearer token', async () => {
  const res = await anon.put(`/products/${fx.lampId}`, { price: 1 });
  assert.equal(res.status, 401);
});

test('PATCH /products/:id/stock updates stock and availability', async () => {
  const res = await merchantA.patch(`/products/${fx.lampId}/stock`, {
    stockQuantity: 3,
    availabilityStatus: 'Low Stock',
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.product.stock_quantity, 3);
  assert.equal(res.data.product.availability_status, 'Low Stock');
});

test('PATCH /products/:id/stock returns 403 for a foreign product', async () => {
  const res = await merchantB.patch(`/products/${fx.lampId}/stock`, { stockQuantity: 0 });
  assert.equal(res.status, 403);
});

test('PATCH /products/:id/stock validates the body with 400', async () => {
  const res = await merchantA.patch(`/products/${fx.lampId}/stock`, { stockQuantity: -5 });
  assert.equal(res.status, 400);
  assert.equal(res.data.error.code, 'VALIDATION_ERROR');
});

test('DELETE /products/:id removes the product', async () => {
  const res = await merchantA.delete(`/products/${fx.lampId}`);
  assert.equal(res.status, 204);

  const gone = await anon.get(`/products/${fx.lampId}`);
  assert.equal(gone.status, 404);

  const ownList = await merchantA.get('/products');
  assert.ok(!ownList.data.products.some((p) => p.id === fx.lampId));
});

test('DELETE /products/:id returns 403 for another merchant product', async () => {
  const res = await merchantA.delete(`/products/${fx.betaNovelId}`);
  assert.equal(res.status, 403);
});

test('DELETE /products/:id requires a bearer token', async () => {
  const res = await anon.delete(`/products/${fx.mouseId}`);
  assert.equal(res.status, 401);
});

test('a socket.io client in the catalog room receives product events', async () => {
  const socket = io(app.baseUrl, { transports: ['websocket'] });
  try {
    await withTimeout(new Promise((resolve) => socket.on('connect', resolve)), 5000, 'socket connect');
    await new Promise((resolve) => setTimeout(resolve, 50));

    const created = new Promise((resolve) => socket.once(EVENTS.PRODUCT_CREATED, resolve));
    const createRes = await merchantA.post('/products', {
      shopId: fx.shopA1.id,
      name: 'Realtime Widget',
      price: 42,
    });
    assert.equal(createRes.status, 201);
    const createdEvent = await withTimeout(created, 5000, EVENTS.PRODUCT_CREATED);
    assert.equal(createdEvent.id, createRes.data.product.id);
    assert.equal(createdEvent.shop_id, fx.shopA1.id);
    assert.equal(createdEvent.name, 'Realtime Widget');

    const updated = new Promise((resolve) => socket.once(EVENTS.PRODUCT_UPDATED, resolve));
    const updateRes = await merchantA.patch(`/products/${createRes.data.product.id}`, {
      price: 45,
    });
    assert.equal(updateRes.status, 200);
    const updatedEvent = await withTimeout(updated, 5000, EVENTS.PRODUCT_UPDATED);
    assert.equal(updatedEvent.id, createRes.data.product.id);
    assert.equal(updatedEvent.price, 45);

    const deleted = new Promise((resolve) => socket.once(EVENTS.PRODUCT_DELETED, resolve));
    const deleteRes = await merchantA.delete(`/products/${createRes.data.product.id}`);
    assert.equal(deleteRes.status, 204);
    const deletedEvent = await withTimeout(deleted, 5000, EVENTS.PRODUCT_DELETED);
    assert.equal(deletedEvent.id, createRes.data.product.id);
    assert.equal(deletedEvent.shop_id, fx.shopA1.id);
  } finally {
    socket.close();
  }
});

// --- §6.3 write routes: POST /shops, PATCH /shops/:id, DELETE /shops/:id ---
// Each test seeds its own merchant/shop rows and never depends on state left
// by earlier tests.

test('POST /shops creates a shop for the authenticated merchant', async () => {
  const merchantId = await insertMerchant('shop-creator@wa.test', 'Shop Creator Co');
  const client = await loginMerchant('shop-creator@wa.test');

  const res = await client.post('/shops', {
    name: 'Creator Candle Store',
    description: 'Hand-poured candles',
    categoryId: fx.category.id,
    address: '5 Maker Alley',
    city: 'Nagpur',
    phone: '9876543211',
    logoUrl: 'https://cdn.test/creator-logo.png',
  });
  assert.equal(res.status, 201);
  assert.equal(res.data.shop.merchant_id, merchantId);
  assert.equal(res.data.shop.name, 'Creator Candle Store');
  assert.equal(res.data.shop.address, '5 Maker Alley');
  assert.equal(res.data.shop.category_id, fx.category.id);
  assert.equal(res.data.shop.status, 'open');

  const detail = await anon.get(`/shops/${res.data.shop.id}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.data.shop.name, 'Creator Candle Store');
});

test('POST /shops validates the body with 400', async () => {
  await insertMerchant('shop-invalid@wa.test', 'Invalid Body Co');
  const client = await loginMerchant('shop-invalid@wa.test');

  const res = await client.post('/shops', { description: 'missing name and address' });
  assert.equal(res.status, 400);
  assert.equal(res.data.error.code, 'VALIDATION_ERROR');
});

test('POST /shops rejects a customer token with 403', async () => {
  const res = await customer.post('/shops', {
    name: 'Customer Shop',
    address: '1 Forbidden Lane',
  });
  assert.equal(res.status, 403);
});

test('PATCH /shops/:id updates an owned shop', async () => {
  const merchantId = await insertMerchant('shop-patcher@wa.test', 'Shop Patcher Co');
  const client = await loginMerchant('shop-patcher@wa.test');
  const shop = await insertShop(merchantId, 'Patch Target', 'open');

  const res = await client.patch(`/shops/${shop.id}`, {
    description: 'Patched via /shops/:id',
    phone: '9876543299',
    city: 'Pune',
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.shop.id, shop.id);
  assert.equal(res.data.shop.merchant_id, merchantId);
  assert.equal(res.data.shop.description, 'Patched via /shops/:id');
  assert.equal(res.data.shop.phone, '9876543299');
  assert.equal(res.data.shop.city, 'Pune');
});

test('PATCH /shops/:id returns 403 for a non-owner merchant', async () => {
  const ownerId = await insertMerchant('shop-owner@wa.test', 'Owns The Shop');
  const shop = await insertShop(ownerId, 'Owner Only Shop', 'open');
  await insertMerchant('shop-intruder@wa.test', 'Intruder Co');
  const intruder = await loginMerchant('shop-intruder@wa.test');

  const res = await intruder.patch(`/shops/${shop.id}`, { name: 'Stolen Name' });
  assert.equal(res.status, 403);

  const unchanged = await anon.get(`/shops/${shop.id}`);
  assert.equal(unchanged.status, 200);
  assert.equal(unchanged.data.shop.name, 'Owner Only Shop');
});

test('PATCH /shops/:id returns 404 for an unknown shop', async () => {
  await insertMerchant('shop-ghost-patcher@wa.test', 'Ghost Patcher Co');
  const client = await loginMerchant('shop-ghost-patcher@wa.test');

  const res = await client.patch('/shops/00000000-0000-0000-0000-000000000003', {
    name: 'Ghost Shop',
  });
  assert.equal(res.status, 404);
  assert.equal(res.data.error.code, 'NOT_FOUND');
});

test('DELETE /shops/:id removes the shop for an admin', async () => {
  const merchantId = await insertMerchant('shop-deleted@wa.test', 'Doomed Shop Co');
  const shop = await insertShop(merchantId, 'Doomed Shop', 'open');

  const res = await admin.delete(`/shops/${shop.id}`);
  assert.equal(res.status, 204);
  assert.equal(res.data, null);

  const gone = await anon.get(`/shops/${shop.id}`);
  assert.equal(gone.status, 404);
});

test('DELETE /shops/:id rejects a merchant with 403', async () => {
  const merchantId = await insertMerchant('shop-self-deleter@wa.test', 'Self Deleter Co');
  const client = await loginMerchant('shop-self-deleter@wa.test');
  const shop = await insertShop(merchantId, 'Self Delete Shop', 'open');

  const res = await client.delete(`/shops/${shop.id}`);
  assert.equal(res.status, 403);

  const stillThere = await anon.get(`/shops/${shop.id}`);
  assert.equal(stillThere.status, 200);
});

test('DELETE /shops/:id returns 404 for an unknown shop', async () => {
  const res = await admin.delete('/shops/00000000-0000-0000-0000-000000000004');
  assert.equal(res.status, 404);
  assert.equal(res.data.error.code, 'NOT_FOUND');
});

test('PATCH /shops/:id emits SHOP_UPDATED to the owning shop room', async () => {
  const merchantId = await insertMerchant('shop-socket@wa.test', 'Socket Shop Co');
  const client = await loginMerchant('shop-socket@wa.test');
  const shop = await insertShop(merchantId, 'Socket Shop', 'open');

  // §7.5: a merchant socket is auto-joined to shop:{id} for shops they own.
  const socket = io(app.baseUrl, { auth: { token: client.accessToken }, transports: ['websocket'] });
  try {
    await withTimeout(new Promise((resolve) => socket.on('connect', resolve)), 5000, 'socket connect');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const updated = new Promise((resolve) => socket.once(EVENTS.SHOP_UPDATED, resolve));
    const res = await client.patch(`/shops/${shop.id}`, {
      description: 'Socket-pushed description',
    });
    assert.equal(res.status, 200);
    const event = await withTimeout(updated, 5000, EVENTS.SHOP_UPDATED);
    assert.equal(event.id, shop.id);
    assert.equal(event.description, 'Socket-pushed description');
  } finally {
    socket.close();
  }
});
