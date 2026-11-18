const pg = require('pg');
require('dotenv').config({ path: 'services/api/.env' });

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const query = `
    INSERT INTO admins (email, full_name, password_hash, role)
    VALUES (
      'nikhileshmendhe07@gmail.com',
      'Nikhilesh Mendhe',
      '$2a$12$NfeGosEFFyO6b1YJlmlSp.RT1hyi8UZYVAN7gYibaLABaJYoNFfW2',
      'super_admin'
    )
    ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        role = 'super_admin';
  `;

  await pool.query(query);
  console.log('✓ Successfully configured nikhileshmendhe07@gmail.com as super_admin in Supabase database!');
  await pool.end();
}

main().catch(console.error);
