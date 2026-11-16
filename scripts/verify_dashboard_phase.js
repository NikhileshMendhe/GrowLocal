import jwt from 'jsonwebtoken';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.nydusjwdmmqtapfjhrpl:Nikhilesh%4007@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 2,
  connectionTimeoutMillis: 10000,
});

async function queryWithRetry(sql, maxTries = 3) {
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    const client = await pool.connect();
    try {
      const res = await client.query(sql);
      client.release();
      return res;
    } catch (err) {
      client.release(true);
      if (attempt === maxTries) throw err;
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

async function runVerification() {
  console.log('--- 1. VERIFY REALTIME PUBLICATION & DIRECT DB COUNTS ---');
  const pubRes = await queryWithRetry(`
    SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;
  `);
  const realtimeTables = pubRes.rows.map(r => r.tablename);
  console.log('Realtime tables in supabase_realtime:', realtimeTables);
  const required = ['customers', 'enquiries', 'orders', 'products'];
  for (const t of required) {
    if (!realtimeTables.includes(t)) throw new Error(`Missing ${t} in supabase_realtime!`);
  }
  console.log('✓ All 4 required tables are in supabase_realtime publication.');

  const dbRes = await queryWithRetry(`
    SELECT
      (SELECT COUNT(*) FROM products WHERE approval_status IS NULL OR approval_status <> 'archived') AS products,
      (SELECT COUNT(*) FROM products WHERE availability_status = 'In Stock' AND (approval_status IS NULL OR approval_status <> 'archived')) AS active_in_stock,
      (SELECT COUNT(*) FROM orders) AS orders,
      (SELECT COUNT(*) FROM enquiries) AS enquiries,
      (SELECT COUNT(*) FROM customers) AS customers;
  `);
  const expected = dbRes.rows[0];
  console.log('Database verified counts:', expected);
  await pool.end();

  console.log('\n--- 2. VERIFY ADMIN AUTHENTICATION ---');
  const loginRes = await fetch('http://localhost:4000/api/auth/admin/login?audience=admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Audience': 'admin' },
    body: JSON.stringify({ email: 'admin@growlocal.in', password: 'Password123!' })
  });
  if (!loginRes.ok) throw new Error(`Admin login failed: ${loginRes.status}`);
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  const decoded = jwt.decode(token);
  console.log('Token Type:', decoded?.type, '| Role:', loginData.user?.role_name);
  if (decoded?.type !== 'admin') throw new Error(`Token type is not admin: ${decoded?.type}`);
  console.log('✓ Admin login successful and authenticated.');

  console.log('\n--- 3. VERIFY DASHBOARD COUNTS API MATCHES DATABASE EXACTLY ---');
  const dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!dashRes.ok) throw new Error(`Dashboard API failed: ${dashRes.status}`);
  const dashData = await dashRes.json();
  const c = dashData.counts;
  console.log('Dashboard API Counts:', c);

  if (Number(c.products) !== Number(expected.products)) throw new Error('Mismatch products');
  if (Number(c.active_in_stock) !== Number(expected.active_in_stock)) throw new Error('Mismatch active_in_stock');
  if (Number(c.orders) !== Number(expected.orders)) throw new Error('Mismatch orders');
  if (Number(c.enquiries) !== Number(expected.enquiries)) throw new Error('Mismatch enquiries');
  if (Number(c.customers) !== Number(expected.customers)) throw new Error('Mismatch customers');
  const totalInquiriesOrders = Number(c.orders) + Number(c.enquiries);
  console.log(`✓ Card 1 (Total Products): ${c.products} matches DB.`);
  console.log(`✓ Card 2 (Active In Stock): ${c.active_in_stock} matches DB.`);
  console.log(`✓ Card 3 (Inquiries & Orders): ${totalInquiriesOrders} (${c.orders} orders + ${c.enquiries} enquiries) matches DB.`);
  console.log(`✓ Card 4 (Registered Customers): ${c.customers} matches DB.`);

  console.log('\n--- 4. VERIFY CARD 1 DESTINATION: PRODUCTS PAGE API ---');
  const prodRes = await fetch('http://localhost:4000/api/admin/products?limit=20', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const prodData = await prodRes.json();
  const prods = prodData.products || [];
  console.log(`Products returned: ${prods.length}, total: ${prodData.total}`);
  if (prods.length !== Number(expected.products)) throw new Error('Products page count mismatch');
  console.log(`✓ Card 1 destination delivers all ${prodData.total} products.`);

  console.log('\n--- 5. VERIFY CARD 2 DESTINATION: ACTIVE IN STOCK PRODUCTS ---');
  const stockRes = await fetch('http://localhost:4000/api/admin/products?availabilityStatus=In+Stock&limit=20', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const stockData = await stockRes.json();
  const inStockProds = stockData.products || [];
  console.log(`In-stock products returned: ${inStockProds.length}, total: ${stockData.total}`);
  if (inStockProds.length !== Number(expected.active_in_stock)) throw new Error('In stock count mismatch');
  for (const p of inStockProds) {
    if (p.availability_status !== 'In Stock') throw new Error(`Non-in-stock product returned: ${p.name}`);
  }
  console.log(`✓ Card 2 destination delivers only active in-stock products (${stockData.total} items).`);

  console.log('\n--- 6. VERIFY CARD 3 DESTINATION: ORDERS & INQUIRIES SEPARATE ---');
  const ordRes = await fetch('http://localhost:4000/api/admin/orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const ordData = await ordRes.json();
  const orders = ordData.orders || [];
  console.log(`Orders returned: ${orders.length}, total: ${ordData.total}`);
  if (orders.length !== Number(expected.orders)) throw new Error('Orders count mismatch');

  const enqRes = await fetch('http://localhost:4000/api/admin/enquiries', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const enqData = await enqRes.json();
  const enqs = enqData.enquiries || [];
  console.log(`Enquiries returned: ${enqs.length}, total: ${enqData.total}`);
  if (enqs.length !== Number(expected.enquiries)) throw new Error('Enquiries count mismatch');
  console.log(`✓ Card 3 destination delivers separate orders (${ordData.total}) and inquiries (${enqData.total}).`);

  console.log('\n--- 7. VERIFY CARD 4 DESTINATION: REGISTERED CUSTOMERS ---');
  const custRes = await fetch('http://localhost:4000/api/admin/customers', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const custData = await custRes.json();
  const custs = custData.customers || [];
  console.log(`Customers returned: ${custs.length}, total: ${custData.total}`);
  if (custs.length !== Number(expected.customers)) throw new Error('Customers count mismatch');
  console.log(`✓ Card 4 destination delivers all ${custData.total} registered customers.`);

  console.log('\n========================================');
  console.log('ALL PHASE VERIFICATION CHECKS PASSED 100%!');
  console.log('========================================');
}

runVerification()
  .catch(err => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  });
