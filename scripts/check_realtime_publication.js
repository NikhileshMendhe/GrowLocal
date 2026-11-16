import { query, pool } from '../services/api/src/db/pool.js';

async function check() {
  const { rows } = await query(`
    SELECT pubname, schemaname, tablename
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime';
  `);
  console.log('Tables in supabase_realtime publication:');
  console.table(rows);
  await pool.end();
}

check().catch(console.error);
