import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.nydusjwdmmqtapfjhrpl:Nikhilesh%4007@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function cleanDummyData() {
  console.log('--- 1. CLEANING SAMPLE ORDERS ---');
  const delOrders = await pool.query('DELETE FROM orders RETURNING id, order_code;');
  console.log(`Deleted ${delOrders.rows.length} sample/test orders:`, delOrders.rows.map(r => r.order_code));

  console.log('\n--- 2. CLEANING FABRICATED ENQUIRIES ---');
  const delEnquiries = await pool.query('DELETE FROM enquiries RETURNING id, enquiry_code;');
  console.log(`Deleted ${delEnquiries.rows.length} fabricated enquiries:`, delEnquiries.rows.map(r => r.enquiry_code));

  console.log('\n--- 3. CLEANING TEST DUMMY CUSTOMER ACCOUNTS ---');
  // First delete any refresh tokens for test accounts
  const testCustomerIds = await pool.query(`
    SELECT id, email, full_name FROM customers
    WHERE email LIKE 'testuser_%'
       OR email LIKE 'cust_order_%'
       OR email LIKE 'customer_1794659058236%'
       OR email LIKE 'test1794%'
       OR email = 'customer@growlocal.in'
       OR email LIKE 'customer_test_%';
  `);
  console.log('Test customers found to remove:', testCustomerIds.rows.map(c => `${c.full_name} (${c.email})`));

  for (const c of testCustomerIds.rows) {
    await pool.query('DELETE FROM refresh_tokens WHERE owner_id = $1;', [c.id]);
    await pool.query('DELETE FROM customers WHERE id = $1;', [c.id]);
  }
  console.log(`Deleted ${testCustomerIds.rows.length} test customer accounts.`);

  console.log('\n--- 4. CLEANING TEST PRODUCTS ---');
  const testProds = await pool.query(`
    DELETE FROM products
    WHERE name = 'Phase 3 Premium Farm Organic Honey 500g'
       OR name = 'age'
    RETURNING id, name;
  `);
  console.log(`Deleted ${testProds.rows.length} test products:`, testProds.rows.map(p => p.name));

  console.log('\n--- 5. VERIFYING CLEANED DATABASE STATE ---');
  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM products WHERE approval_status IS NULL OR approval_status <> 'archived') AS products,
      (SELECT COUNT(*) FROM products WHERE availability_status = 'In Stock' AND (approval_status IS NULL OR approval_status <> 'archived')) AS active_in_stock,
      (SELECT COUNT(*) FROM orders) AS orders,
      (SELECT COUNT(*) FROM enquiries) AS enquiries,
      (SELECT COUNT(*) FROM customers) AS customers;
  `);
  console.log('Cleaned DB Counts:', counts.rows[0]);

  const remainingCusts = await pool.query('SELECT full_name, email FROM customers;');
  console.log('Remaining Real Customers:', remainingCusts.rows);

  const remainingProds = await pool.query('SELECT name, price, availability_status FROM products;');
  console.log('Remaining Real Products (' + remainingProds.rows.length + '):', remainingProds.rows.map(p => `${p.name} - ₹${p.price} (${p.availability_status})`));
}

cleanDummyData()
  .then(() => {
    console.log('\nALL DUMMY DATA CLEANED SUCCESSFULLY!');
    pool.end();
  })
  .catch(err => {
    console.error('Error cleaning dummy data:', err);
    pool.end();
    process.exit(1);
  });
