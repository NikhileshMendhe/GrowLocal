import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Nikhilesh%4007@db.nydusjwdmmqtapfjhrpl.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log(`\nFound ${tablesRes.rows.length} tables in public schema:`);
  for (const r of tablesRes.rows) {
    try {
      const countRes = await client.query(`SELECT COUNT(*) FROM public."${r.table_name}"`);
      console.log(`- ${r.table_name}: ${countRes.rows[0].count} rows`);
    } catch (e) {
      console.log(`- ${r.table_name}: error (${e.message})`);
    }
  }

  // Also inspect auth.users
  try {
    const authRes = await client.query('SELECT COUNT(*) FROM auth.users');
    console.log(`\n- auth.users: ${authRes[0]?.count || authRes.rows[0].count} users`);
  } catch (e) {
    console.log(`- auth.users: error (${e.message})`);
  }

  await client.end();
}

inspect().catch(err => {
  console.error('Database inspection failed:', err);
  process.exit(1);
});
