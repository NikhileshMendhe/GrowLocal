import { pool } from '../services/api/src/db/pool.js';
import bcrypt from 'bcryptjs';

async function setup() {
  const password = 'Password123!';
  const passwordHash = await bcrypt.hash(password, 10);

  console.log('Setting up demo accounts with password:', password);

  // 1. Merchant Demo Account
  const merchantEmail = 'merchant@growlocal.in';
  const existingMerchant = await pool.query('SELECT id FROM merchants WHERE email = $1', [merchantEmail]);
  if (existingMerchant.rows.length > 0) {
    await pool.query(
      'UPDATE merchants SET password_hash = $1, status = $2 WHERE email = $3',
      [passwordHash, 'active', merchantEmail]
    );
    console.log('Updated merchant account:', merchantEmail);
  } else {
    await pool.query(
      `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone, status)
       VALUES ($1, $2, $3, $4, $5, 'active')`,
      ['Nagpur Superstore', 'Rajesh Sharma', merchantEmail, passwordHash, '+91 98765 43210']
    );
    console.log('Created merchant account:', merchantEmail);
  }

  // Ensure merchant has a shop
  const merchantRow = (await pool.query('SELECT id FROM merchants WHERE email = $1', [merchantEmail])).rows[0];
  const existingShop = await pool.query('SELECT id FROM shops WHERE merchant_id = $1', [merchantRow.id]);
  if (existingShop.rows.length === 0) {
    await pool.query(
      `INSERT INTO shops (merchant_id, name, address, city, phone, is_verified, status)
       VALUES ($1, 'Nagpur Superstore', 'Sitabuldi Main Road', 'Nagpur', '+91 98765 43210', true, 'open')`,
      [merchantRow.id]
    );
    console.log('Created shop for merchant');
  }

  // 2. Customer Demo Account
  const customerEmail = 'customer@growlocal.in';
  const existingCustomer = await pool.query('SELECT id FROM customers WHERE email = $1', [customerEmail]);
  if (existingCustomer.rows.length > 0) {
    await pool.query(
      'UPDATE customers SET password_hash = $1, status = $2 WHERE email = $3',
      [passwordHash, 'active', customerEmail]
    );
    console.log('Updated customer account:', customerEmail);
  } else {
    await pool.query(
      `INSERT INTO customers (full_name, email, password_hash, phone, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      ['Priya Customer', customerEmail, passwordHash, '+91 98765 00000']
    );
    console.log('Created customer account:', customerEmail);
  }

  // 3. Admin Demo Account
  const adminEmail = 'admin@growlocal.in';
  const existingAdmin = await pool.query('SELECT id FROM admins WHERE email = $1', [adminEmail]);
  if (existingAdmin.rows.length > 0) {
    await pool.query(
      'UPDATE admins SET password_hash = $1, is_active = true WHERE email = $2',
      [passwordHash, adminEmail]
    );
    console.log('Updated admin account:', adminEmail);
  } else {
    await pool.query(
      `INSERT INTO admins (email, password_hash, role_name, is_active)
       VALUES ($1, $2, 'admin', true)`,
      [adminEmail, passwordHash]
    );
    console.log('Created admin account:', adminEmail);
  }

  console.log('\n--- DEMO CREDENTIALS READY ---');
  console.log('Password for all accounts:', password);
  console.log('Merchant: ' + merchantEmail);
  console.log('Customer: ' + customerEmail);
  console.log('Admin:    ' + adminEmail);

  await pool.end();
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
