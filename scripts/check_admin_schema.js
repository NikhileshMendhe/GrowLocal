import pg from 'pg';

async function check() {
  const client = new pg.Client({
    connectionString: 'postgresql://postgres.nydusjwdmmqtapfjhrpl:Nikhilesh%4007@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res1 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position;");
  console.log('orders columns:', res1.rows.map(r => `${r.column_name} (${r.data_type})`));
  
  const res2 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'enquiries' ORDER BY ordinal_position;");
  console.log('enquiries columns:', res2.rows.map(r => `${r.column_name} (${r.data_type})`));

  const res3 = await client.query("SELECT id, name, slug FROM categories ORDER BY name;");
  console.log('categories:', res3.rows);

  await client.end();
}

check().catch(console.error);
