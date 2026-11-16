import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.nydusjwdmmqtapfjhrpl:Nikhilesh%4007@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const fks = await pool.query(`
    SELECT
      tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name IN ('orders', 'enquiries', 'customers', 'products');
  `);
  console.log('FK references:', fks.rows);

  const orderItems = await pool.query(`SELECT COUNT(*) FROM order_items;`).catch(() => ({ rows: [{ count: 'no table' }] }));
  console.log('order_items count:', orderItems.rows[0].count);

  const orderEvents = await pool.query(`SELECT COUNT(*) FROM order_events;`).catch(() => ({ rows: [{ count: 'no table' }] }));
  console.log('order_events count:', orderEvents.rows[0].count);

  const enquiryMsgs = await pool.query(`SELECT COUNT(*) FROM enquiry_messages;`).catch(() => ({ rows: [{ count: 'no table' }] }));
  console.log('enquiry_messages count:', enquiryMsgs.rows[0].count);

  const reviews = await pool.query(`SELECT COUNT(*) FROM reviews WHERE order_id IS NOT NULL;`).catch(() => ({ rows: [{ count: 'no table' }] }));
  console.log('reviews referencing orders:', reviews.rows[0].count);
}

run().then(() => pool.end()).catch(err => { console.error(err); pool.end(); });
