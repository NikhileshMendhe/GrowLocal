const pg = require('pg');
require('dotenv').config({ path: 'services/api/.env' });
const { signAccessToken } = require('../services/api/src/utils/jwt.js');

const API_BASE = 'http://localhost:4000/api';

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log('--- Testing Product Deletion Fix ---');

  // 1. Get an existing shop id to create a test product
  const { rows: shops } = await pool.query('SELECT id FROM shops LIMIT 1');
  const shopId = shops[0]?.id;

  // 2. Insert temporary test product
  const { rows: inserted } = await pool.query(
    `INSERT INTO products (shop_id, name, slug, price, stock_quantity, approval_status, availability_status)
     VALUES ($1, 'Test Delete Product Fix', 'test-delete-product-fix', 199.00, 5, 'approved', 'In Stock')
     RETURNING id, name`,
    [shopId]
  );
  const testProd = inserted[0];
  console.log(`✓ Inserted test product: "${testProd.name}" (${testProd.id})`);

  // 3. Attach a dummy product image to test cascade / unlinking
  await pool.query(
    `INSERT INTO product_images (product_id, image_url, display_order)
     VALUES ($1, 'https://example.com/test.jpg', 0)`,
    [testProd.id]
  );
  console.log('✓ Attached dummy product_image');

  // 4. Generate admin token
  const adminToken = signAccessToken({
    id: '00000000-0000-0000-0000-000000000001',
    type: 'admin',
  });

  // 5. Delete product via API
  const res = await fetch(`${API_BASE}/products/${testProd.id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  console.log(`✓ DELETE /api/products/${testProd.id} status: ${res.status}`);
  if (res.status !== 204 && res.status !== 200) {
    const text = await res.text();
    throw new Error(`Delete failed with status ${res.status}: ${text}`);
  }

  // 6. Verify product is gone in DB
  const { rows: check } = await pool.query('SELECT id FROM products WHERE id = $1', [testProd.id]);
  const { rows: checkImg } = await pool.query('SELECT id FROM product_images WHERE product_id = $1', [testProd.id]);

  if (check.length === 0 && checkImg.length === 0) {
    console.log('✓ Verified: Product and related images completely deleted from PostgreSQL database');
  } else {
    throw new Error(`Product still exists: products=${check.length}, images=${checkImg.length}`);
  }

  await pool.end();
  console.log('🎉 Product deletion fix verified successfully!');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
