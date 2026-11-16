import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.nydusjwdmmqtapfjhrpl',
  password: 'Nikhilesh@07',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspectCounts() {
  await client.connect();
  console.log('Connected to PostgreSQL successfully!');
  const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  
  for (const row of tablesRes.rows) {
    const t = row.table_name;
    try {
      const countRes = await client.query(`SELECT count(*) FROM "${t}";`);
      const count = parseInt(countRes.rows[0].count);
      if (count > 0) {
        console.log(`- ${t}: ${count} rows`);
      }
    } catch (e) {
      console.log(`- ${t}: error ${e.message}`);
    }
  }

  // Also check auth.users if accessible
  try {
    const authUsersRes = await client.query('SELECT count(*) FROM auth.users;');
    console.log(`- auth.users: ${authUsersRes.rows[0].count} rows`);
  } catch (e) {
    console.log('- auth.users check:', e.message);
  }

  await client.end();
}

inspectCounts().catch(console.error);
