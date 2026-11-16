import { query, pool } from '../services/api/src/db/pool.js';

async function check() {
  const { rows } = await query(`
    SELECT column_name, is_nullable, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'enquiries'
    ORDER BY ordinal_position;
  `);
  console.table(rows);
  await pool.end();
}

check().catch(console.error);
