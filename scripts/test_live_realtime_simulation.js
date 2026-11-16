import jwt from 'jsonwebtoken';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.nydusjwdmmqtapfjhrpl:Nikhilesh%4007@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 2,
  connectionTimeoutMillis: 10000,
});

async function queryWithRetry(sql, params = [], maxTries = 3) {
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    const client = await pool.connect();
    try {
      const res = await client.query(sql, params);
      client.release();
      return res;
    } catch (err) {
      client.release(true);
      if (attempt === maxTries) throw err;
      await new Promise(r => setTimeout(r, 400));
    }
  }
}

async function testDynamicUpdates() {
  console.log('--- 1. AUTHENTICATE AS ADMIN ---');
  const loginRes = await fetch('http://localhost:4000/api/auth/admin/login?audience=admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Audience': 'admin' },
    body: JSON.stringify({ email: 'admin@growlocal.in', password: 'Password123!' })
  });
  const { accessToken } = await loginRes.json();

  console.log('\n--- 2. BASELINE DASHBOARD COUNTS ---');
  let dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  let dashData = await dashRes.json();
  const baseProducts = Number(dashData.counts.products);
  const baseInStock = Number(dashData.counts.active_in_stock);
  const baseCustomers = Number(dashData.counts.customers);
  console.log(`Baseline Products: ${baseProducts}, In Stock: ${baseInStock}, Customers: ${baseCustomers}`);

  console.log('\n--- 3. TEST PRODUCT INSERTION & LIVE COUNT REFLECTION ---');
  const shopRes = await queryWithRetry(`SELECT id FROM shops LIMIT 1;`);
  const catRes = await queryWithRetry(`SELECT id FROM categories LIMIT 1;`);
  const validShopId = shopRes.rows[0].id;
  const validCatId = catRes.rows[0].id;

  const insertProdRes = await queryWithRetry(`
    INSERT INTO products (
      shop_id, category_id, name, slug, description, price, availability_status, approval_status
    ) VALUES (
      $1,
      $2,
      'Realtime Test Organic Kiwi',
      'realtime-test-organic-kiwi',
      'Fresh juicy test fruit for realtime verification',
      120.00,
      'In Stock',
      'approved'
    ) RETURNING id;
  `, [validShopId, validCatId]);
  const testProdId = insertProdRes.rows[0].id;
  console.log('Inserted test product ID:', testProdId);

  dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  dashData = await dashRes.json();
  console.log(`Updated Products: ${dashData.counts.products} (expected ${baseProducts + 1}), In Stock: ${dashData.counts.active_in_stock} (expected ${baseInStock + 1})`);
  if (Number(dashData.counts.products) !== baseProducts + 1) {
    throw new Error('Total Products did not increment dynamically!');
  }
  if (Number(dashData.counts.active_in_stock) !== baseInStock + 1) {
    throw new Error('Active in Stock did not increment dynamically!');
  }
  console.log('✓ Product insertion dynamically reflected in dashboard stats.');

  console.log('\n--- 4. TEST PRODUCT STOCK STATUS CHANGE ---');
  await queryWithRetry(`
    UPDATE products SET availability_status = 'Out of Stock' WHERE id = $1;
  `, [testProdId]);

  dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  dashData = await dashRes.json();
  console.log(`After status change - Products: ${dashData.counts.products}, In Stock: ${dashData.counts.active_in_stock} (expected ${baseInStock})`);
  if (Number(dashData.counts.active_in_stock) !== baseInStock) {
    throw new Error('Active in Stock did not update when product became Out of Stock!');
  }
  console.log('✓ Stock status change dynamically reflected in Active in Stock count.');

  console.log('\n--- 5. CLEAN UP TEST PRODUCT ---');
  await queryWithRetry(`DELETE FROM products WHERE id = $1;`, [testProdId]);

  dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  dashData = await dashRes.json();
  console.log(`After cleanup - Products: ${dashData.counts.products} (expected ${baseProducts}), In Stock: ${dashData.counts.active_in_stock} (expected ${baseInStock})`);
  if (Number(dashData.counts.products) !== baseProducts) {
    throw new Error('Product count did not decrement on delete!');
  }
  console.log('✓ Product deletion dynamically reflected in dashboard stats.');

  console.log('\n--- 6. TEST CUSTOMER REGISTRATION & LIVE COUNT REFLECTION ---');
  const custRes = await fetch('http://localhost:4000/api/auth/customer/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Realtime Test Customer',
      email: 'realtime.test.unique@growlocal.in',
      phone: '9999900001',
      password: 'Password123!',
    }),
  });
  if (!custRes.ok) {
    const errText = await custRes.text();
    throw new Error(`Customer signup failed: ${custRes.status} ${errText}`);
  }
  const custData = await custRes.json();
  const testCustId = custData.user.id;
  console.log('Registered test customer ID:', testCustId);

  dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  dashData = await dashRes.json();
  console.log(`Updated Customers: ${dashData.counts.customers} (expected ${baseCustomers + 1})`);
  if (Number(dashData.counts.customers) !== baseCustomers + 1) {
    throw new Error('Customer count did not increment dynamically!');
  }
  console.log('✓ Customer registration dynamically reflected in dashboard stats.');

  console.log('\n--- 7. CLEAN UP TEST CUSTOMER ---');
  await queryWithRetry(`DELETE FROM refresh_tokens WHERE owner_id = $1;`, [testCustId]);
  await queryWithRetry(`DELETE FROM customers WHERE id = $1;`, [testCustId]);

  dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  dashData = await dashRes.json();
  console.log(`After cleanup - Customers: ${dashData.counts.customers} (expected ${baseCustomers})`);
  if (Number(dashData.counts.customers) !== baseCustomers) {
    throw new Error('Customer count did not decrement on delete!');
  }
  console.log('✓ Customer cleanup dynamically reflected.');

  console.log('\n=============================================');
  console.log('REAL-TIME DYNAMIC UPDATE TEST 100% SUCCESSFUL!');
  console.log('=============================================');
}

testDynamicUpdates()
  .then(() => pool.end())
  .catch(err => {
    console.error('TEST FAILED:', err);
    pool.end();
    process.exit(1);
  });
