import { query, pool } from '../services/api/src/db/pool.js';

async function checkCounts() {
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM products WHERE approval_status IS NULL OR approval_status <> 'archived') AS total_active_catalog_products,
      (SELECT COUNT(*)::int FROM products WHERE (approval_status IS NULL OR approval_status <> 'archived') AND availability_status = 'In Stock') AS active_in_stock,
      (SELECT COUNT(*)::int FROM customers) AS registered_customers,
      (SELECT COUNT(*)::int FROM orders) AS real_orders,
      (SELECT COUNT(*)::int FROM enquiries) AS real_enquiries;
  `);
  console.log('Real Supabase Database counts:');
  console.table(rows);

  const enquiriesSample = await query('SELECT id, enquiry_code, customer_id, product_id, message, status, created_at FROM enquiries ORDER BY created_at DESC LIMIT 5');
  console.log('Recent Enquiries in DB:');
  console.table(enquiriesSample.rows);

  const ordersSample = await query('SELECT id, order_code, customer_id, product_id, quantity, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
  console.log('Recent Orders in DB:');
  console.table(ordersSample.rows);

  await pool.end();
}

checkCounts().catch(console.error);
