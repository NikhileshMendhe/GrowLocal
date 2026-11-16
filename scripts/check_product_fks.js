import { query, pool } from '../services/api/src/db/pool.js';

async function checkFKs() {
  const { rows } = await query(`
    SELECT
      tc.table_schema, 
      tc.constraint_name, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE ccu.table_name = 'products';
  `);
  console.log('Foreign keys referencing products:');
  console.table(rows);
  
  const triggers = await query(`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'products';
  `);
  console.log('Triggers on products:');
  console.table(triggers.rows);

  await pool.end();
}

checkFKs().catch(console.error);
