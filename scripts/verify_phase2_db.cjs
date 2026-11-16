const { pool } = require('../services/api/src/db/pool.js');

async function verify() {
  const client = await pool.connect();
  try {
    const pubRes = await client.query(`
      SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;
    `);
    console.log('=== REALTIME TABLES ===');
    console.log(pubRes.rows.map(r => r.tablename));

    const tables = ['customer_activities', 'order_items', 'order_status_history', 'deliveries'];
    for (const t of tables) {
      const colRes = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [t]);
      console.log(`\n=== TABLE: ${t} ===`);
      console.table(colRes.rows);
    }

    const orderCols = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name IN ('product_id', 'shop_id', 'merchant_id');
    `);
    console.log('\n=== ORDERS NULLABILITY ===');
    console.table(orderCols.rows);

    console.log('✅ Verification completed!');
  } finally {
    client.release();
    process.exit(0);
  }
}

verify().catch(console.error);
