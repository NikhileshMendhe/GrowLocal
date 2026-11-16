import { pool } from '../services/api/src/db/pool.js';

async function audit() {
  console.log('=== DATABASE AUDIT ===');
  
  // 1. Tables in public schema
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  console.log('Public Tables (' + tables.rows.length + '):');
  console.log(tables.rows.map(r => r.table_name).join(', '));

  // 2. Products table structure
  const productCols = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    ORDER BY ordinal_position
  `);
  console.log('\nProducts Columns:');
  console.table(productCols.rows);

  // 3. Categories table structure
  const catCols = await pool.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'categories' 
    ORDER BY ordinal_position
  `);
  console.log('\nCategories Columns:');
  console.table(catCols.rows);

  // 4. Customers & Profiles table structure
  const customerCols = await pool.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'customers' 
    ORDER BY ordinal_position
  `);
  console.log('\nCustomers Columns:');
  console.table(customerCols.rows);

  const profilesCheck = await pool.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    ORDER BY ordinal_position
  `);
  console.log('\nProfiles Columns (if exists):');
  console.table(profilesCheck.rows);

  // 5. Auth schema / Supabase auth users
  try {
    const authUsers = await pool.query(`
      SELECT id, email, created_at, role 
      FROM auth.users 
      LIMIT 5
    `);
    console.log('\nSupabase auth.users sample count:', authUsers.rows.length);
    console.log(authUsers.rows);
  } catch (err) {
    console.log('\nauth.users query note:', err.message);
  }

  // 6. Check Foreign Keys on products
  const productFks = await pool.query(`
    SELECT
      tc.table_name, kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='products'
  `);
  console.log('\nProducts Foreign Keys:');
  console.table(productFks.rows);

  // 7. Check Storage Buckets
  try {
    const buckets = await pool.query(`SELECT id, name, public FROM storage.buckets`);
    console.log('\nStorage Buckets:');
    console.table(buckets.rows);
  } catch (err) {
    console.log('\nstorage.buckets note:', err.message);
  }

  // 8. Count existing records
  const counts = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM products) as products_count,
      (SELECT COUNT(*) FROM categories) as categories_count,
      (SELECT COUNT(*) FROM customers) as customers_count,
      (SELECT COUNT(*) FROM merchants) as merchants_count,
      (SELECT COUNT(*) FROM shops) as shops_count,
      (SELECT COUNT(*) FROM orders) as orders_count
  `);
  console.log('\nRecord Counts:');
  console.table(counts.rows);

  await pool.end();
}

audit().catch(console.error);
