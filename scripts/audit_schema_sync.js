import pg from 'pg';
import fs from 'fs';

const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.nydusjwdmmqtapfjhrpl',
  password: 'Nikhilesh@07',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to PG');

  // Read migration file
  const migration = fs.readFileSync('services/api/src/db/migrations/1792140000001_init.js', 'utf8');

  // Extract CREATE TABLE statements
  const tableRegex = /CREATE TABLE (?:IF NOT EXISTS )?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/g;
  let match;
  const expectedTables = {};

  while ((match = tableRegex.exec(migration)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns = [];
    const lines = body.split('\n');
    for (const l of lines) {
      const trimmed = l.trim().replace(/,$/, '');
      if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('PRIMARY KEY') || trimmed.startsWith('CONSTRAINT') || trimmed.startsWith('CHECK') || trimmed.startsWith('FOREIGN KEY')) continue;
      const parts = trimmed.split(/\s+/);
      if (parts[0] && !parts[0].startsWith(')')) {
        columns.push(parts[0]);
      }
    }
    expectedTables[tableName] = columns;
  }

  console.log(`Found ${Object.keys(expectedTables).length} tables in migration definition.`);

  // Get current DB columns
  const dbColsRes = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public';
  `);

  const dbTables = {};
  for (const r of dbColsRes.rows) {
    if (!dbTables[r.table_name]) dbTables[r.table_name] = new Set();
    dbTables[r.table_name].add(r.column_name);
  }

  const missingColumns = [];
  const missingTables = [];

  for (const [table, cols] of Object.entries(expectedTables)) {
    if (!dbTables[table]) {
      missingTables.push(table);
      continue;
    }
    for (const col of cols) {
      if (!dbTables[table].has(col)) {
        missingColumns.push({ table, col });
      }
    }
  }

  console.log('\nMISSING TABLES:', missingTables);
  console.log('\nMISSING COLUMNS IN EXISTING TABLES:');
  for (const m of missingColumns) {
    console.log(`- ${m.table}.${m.col}`);
  }

  await client.end();
}

main().catch(console.error);

