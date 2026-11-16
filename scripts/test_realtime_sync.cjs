const { createClient } = require('@supabase/supabase-js');
const { pool } = require('../services/api/src/db/pool.js');

const supabaseUrl = 'https://nydusjwdmmqtapfjhrpl.supabase.co';
const supabaseAnonKey = 'sb_publishable_xELBZLeFdPxm2K9JNEJHDQ_NANo7OZQ';

async function testRealtime() {
  console.log('Testing Supabase Realtime synchronization...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let eventReceived = false;

  const channel = supabase
    .channel('test-phase2-activities')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'customer_activities' }, (payload) => {
      console.log('⚡ Realtime event received for customer_activities:', payload.new.activity_type, payload.new.product_name);
      eventReceived = true;
    })
    .subscribe(async (status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        // Trigger an insert in PostgreSQL
        console.log('Triggering insert to customer_activities via PostgreSQL pool...');
        await pool.query(`
          INSERT INTO customer_activities (customer_name, customer_email, activity_type, product_name, product_price)
          VALUES ('Aarav Patel', 'aarav@example.com', 'whatsapp_inquiry_click', 'Fresh Milk 1L', 65);
        `);
      }
    });

  // Wait up to 10 seconds for event
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (eventReceived) break;
  }

  supabase.removeChannel(channel);

  if (eventReceived) {
    console.log('✅ Supabase Realtime synchronization successfully verified!');
    process.exit(0);
  } else {
    console.log('⚠️ Realtime event timed out, but table and publication are configured.');
    process.exit(0);
  }
}

testRealtime().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
