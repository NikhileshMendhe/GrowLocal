import pg from 'pg';
const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.nydusjwdmmqtapfjhrpl',///
  password: 'Nikhilesh@07',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  await client.connect();
  const tables = ['customers', 'merchants', 'shops', 'products', 'orders', 'enquiries', 'messages', 'conversations'];
  for (const t of tables) {
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = '${t}' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log(`=== Table ${t} (${res.rows.length} columns) ===`);
    if (res.rows.length > 0) {
      console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    } else {
      console.log('DOES NOT EXIST');
    }
  }
  await client.end();
}
checkColumns().catch(console.error);
