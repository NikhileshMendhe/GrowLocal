import { query, pool } from '../services/api/src/db/pool.js';

async function updatePub() {
  try {
    await query('ALTER PUBLICATION supabase_realtime ADD TABLE customers;');
    console.log('✓ Added customers to supabase_realtime');
  } catch (e) {
    console.log('Note on customers:', e.message);
  }

  try {
    await query('ALTER PUBLICATION supabase_realtime ADD TABLE orders;');
    console.log('✓ Added orders to supabase_realtime');
  } catch (e) {
    console.log('Note on orders:', e.message);
  }

  const { rows } = await query(`
    SELECT pubname, tablename
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime';
  `);
  console.table(rows);
  await pool.end();
}

updatePub().catch(console.error);
