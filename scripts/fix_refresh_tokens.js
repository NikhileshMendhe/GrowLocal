import pg from 'pg';

const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.nydusjwdmmqtapfjhrpl',
  password: 'Nikhilesh@07',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Connected to PG');

  await client.query(`
    ALTER TABLE refresh_tokens 
      ADD COLUMN IF NOT EXISTS owner_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS owner_id UUID,
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);
  `);
  console.log('Columns added successfully.');

  try {
    await client.query('ALTER TABLE refresh_tokens ALTER COLUMN user_type DROP NOT NULL;');
    await client.query('ALTER TABLE refresh_tokens ALTER COLUMN user_id DROP NOT NULL;');
  } catch (e) {
    console.log('Drop NOT NULL note:', e.message);
  }

  const cols = await client.query(`
    SELECT column_name, is_nullable, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'refresh_tokens' AND table_schema = 'public'
    ORDER BY ordinal_position;
  `);
  console.log('Current columns in refresh_tokens:', cols.rows);

  await client.end();
}

run().catch(console.error);

