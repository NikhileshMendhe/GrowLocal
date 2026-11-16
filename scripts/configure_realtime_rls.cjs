const { pool } = require('../services/api/src/db/pool.js');

async function setReplicaIdentity() {
  const client = await pool.connect();
  try {
    console.log('Setting REPLICA IDENTITY FULL for realtime tables...');
    const tables = [
      'customer_activities',
      'orders',
      'customers',
      'enquiries',
      'products',
      'deliveries',
      'order_items',
      'order_status_history',
      'notifications'
    ];

    for (const t of tables) {
      await client.query(`ALTER TABLE "${t}" REPLICA IDENTITY FULL;`);
      console.log(`Set REPLICA IDENTITY FULL on ${t}`);
    }

    // Enable RLS with permissive SELECT policy for customer_activities so Realtime walrus filter allows anon/authenticated clients to receive updates
    await client.query(`
      ALTER TABLE customer_activities ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow read customer_activities" ON customer_activities;
      CREATE POLICY "Allow read customer_activities" ON customer_activities FOR SELECT USING (true);

      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow read orders" ON orders;
      CREATE POLICY "Allow read orders" ON orders FOR SELECT USING (true);

      ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow read deliveries" ON deliveries;
      CREATE POLICY "Allow read deliveries" ON deliveries FOR SELECT USING (true);

      ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow read customers" ON customers;
      CREATE POLICY "Allow read customers" ON customers FOR SELECT USING (true);
    `);

    console.log('✅ REPLICA IDENTITY and RLS policies configured!');
  } finally {
    client.release();
    process.exit(0);
  }
}

setReplicaIdentity().catch(e => {
  console.error(e);
  process.exit(1);
});
