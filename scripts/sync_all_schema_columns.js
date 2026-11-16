import pg from 'pg';

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
  console.log('Connected to PostgreSQL');

  const statements = [
    // 1. password_reset_tokens table
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('customer', 'merchant', 'admin')),
      owner_id UUID NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 2. orders missing columns
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE;`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS origin VARCHAR(20) DEFAULT 'direct';`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_or_delivery_time TIMESTAMPTZ;`,
    `UPDATE orders o SET merchant_id = s.merchant_id FROM shops s WHERE o.shop_id = s.id AND o.merchant_id IS NULL;`,

    // 3. conversations missing columns
    `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;`,

    // 4. messages missing columns
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20);`,
    `DO $$
     BEGIN
       IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_role') THEN
         UPDATE messages SET sender_type = sender_role WHERE sender_type IS NULL AND sender_role IS NOT NULL;
       END IF;
     END $$;`,

    // 5. reviews missing columns
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;`,

    // 6. review_reports missing columns
    `ALTER TABLE review_reports ADD COLUMN IF NOT EXISTS reported_by_customer_id UUID REFERENCES customers(id) ON DELETE CASCADE;`,

    // 7. search_history missing columns
    `ALTER TABLE search_history ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;`,

    // 8. notifications missing columns
    `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20);`,
    `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_id UUID;`,
    `DO $$
     BEGIN
       IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
         UPDATE notifications SET recipient_id = user_id WHERE recipient_id IS NULL AND user_id IS NOT NULL;
       END IF;
       IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_type') THEN
         UPDATE notifications SET recipient_type = user_type WHERE recipient_type IS NULL AND user_type IS NOT NULL;
       END IF;
     END $$;`,

    // 9. analytics_events missing columns
    `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS actor_type VARCHAR(20);`,
    `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS actor_id UUID;`,

    // 10. payments missing columns
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;`,

    // 11. campaign_metrics missing columns
    `ALTER TABLE campaign_metrics ADD COLUMN IF NOT EXISTS orders INT DEFAULT 0;`,

    // 12. admins missing columns
    `ALTER TABLE admins ADD COLUMN IF NOT EXISTS role_name VARCHAR(100) DEFAULT 'admin';`,
    `ALTER TABLE admins ADD COLUMN IF NOT EXISTS department VARCHAR(100);`,
    `DO $$
     BEGIN
       IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'role') THEN
         UPDATE admins SET role_name = role WHERE role_name IS NULL AND role IS NOT NULL;
       END IF;
     END $$;`
  ];

  for (const sql of statements) {
    try {
      await client.query(sql);
      console.log('✓ Executed:', sql.slice(0, 60).replace(/\n/g, ' ') + '...');
    } catch (e) {
      console.error('✗ Failed:', sql.slice(0, 60).replace(/\n/g, ' '), e.message);
    }
  }

  console.log('\nAll schema sync statements finished.');
  await client.end();
}

main().catch(console.error);

