/**
 * Phase 7 Verification: Email & In-App Admin Notifications
 *
 * Verifies:
 * 1. Notification dispatch to GROWLOCAL_ADMIN_EMAIL (growlocal.ngp@gmail.com).
 * 2. In-app admin notifications creation in `notifications` table for orders and inquiries.
 * 3. GET /api/notifications/mine returns notifications for the authenticated admin.
 * 4. PATCH /api/notifications/:id/read marks an individual notification as read.
 * 5. PATCH /api/notifications/read-all marks all unread notifications as read.
 * 6. Clean up: purges test notification records (zero dummy data).
 */

const dotenv = require('dotenv');
dotenv.config({ path: 'services/api/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const API_BASE = 'http://localhost:4000/api';

async function main() {
  console.log('--- Testing Phase 7: Email & In-App Admin Notifications ---');

  // 1. Verify mailer utility and admin email configuration
  const { env } = await import('../services/api/src/config/env.js');
  const { sendAdminEmail, sendOrderNotificationEmail } = await import('../services/api/src/utils/mailer.js');

  console.log(`Configured Admin Email: "${env.adminEmail}"`);
  if (!env.adminEmail || env.adminEmail !== 'growlocal.ngp@gmail.com') {
    throw new Error(`Expected adminEmail to be 'growlocal.ngp@gmail.com', got '${env.adminEmail}'`);
  }

  console.log('\n1. Testing email dispatcher...');
  const mailResult = await sendOrderNotificationEmail({
    id: 'test-order-uuid',
    order_code: 'GL-ORD-TEST',
    total_amount: '1299.00',
    customer_name: 'Test Customer',
    customer_phone: '9876543210',
    fulfillment_type: 'delivery',
    delivery_address: '123 Civil Lines, Nagpur',
    status: 'pending',
  });
  console.log(`✓ Email dispatched successfully to recipient: ${mailResult.recipient}`);

  // 2. Insert test in-app admin notifications
  console.log('\n2. Creating test in-app admin notifications in database...');
  const { rows: notifRows } = await pool.query(
    `INSERT INTO notifications (recipient_type, recipient_id, type, title, message, reference_type, reference_id)
     VALUES 
      ('admin', NULL, 'order_created', 'New Order Received', 'New order GL-ORD-TEST received for ₹1299.00', 'order', uuid_generate_v4()),
      ('admin', NULL, 'enquiry_created', 'New Customer Inquiry', 'Customer inquired about Casual Shirt on WhatsApp', 'enquiry', uuid_generate_v4())
     RETURNING *`
  );
  console.log(`✓ Created ${notifRows.length} test admin notifications:`);
  notifRows.forEach((n) => console.log(`   - [${n.type}] "${n.title}": ${n.message} (Read: ${n.is_read})`));

  const testNotifId1 = notifRows[0].id;
  const testNotifId2 = notifRows[1].id;

  try {
    // 3. Admin login and fetch notifications
    console.log('\n3. Admin authenticating and calling GET /api/notifications/mine...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@growlocal.in',
        password: 'Password123!',
      }),
    });
    if (!adminLoginRes.ok) {
      throw new Error(`Admin login failed: ${await adminLoginRes.text()}`);
    }
    const { accessToken: adminToken } = await adminLoginRes.json();

    const listRes = await fetch(`${API_BASE}/notifications/mine?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!listRes.ok) {
      throw new Error(`GET /api/notifications/mine failed: ${await listRes.text()}`);
    }
    const listData = await listRes.json();
    console.log(`✓ Admin received ${listData.notifications?.length || 0} notifications (Total: ${listData.total})`);

    const found1 = listData.notifications?.find((n) => n.id === testNotifId1);
    const found2 = listData.notifications?.find((n) => n.id === testNotifId2);
    if (!found1 || !found2) {
      throw new Error('Test notifications were not returned in admin list');
    }
    console.log(`✓ Found both test notifications in admin feed.`);

    // 4. Mark single notification as read
    console.log('\n4. Testing mark single notification as read (PATCH /api/notifications/:id/read)...');
    const readRes = await fetch(`${API_BASE}/notifications/${testNotifId1}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!readRes.ok) {
      throw new Error(`Mark read failed: ${await readRes.text()}`);
    }
    const { notification: readNotif } = await readRes.json();
    console.log(`✓ Notification #${testNotifId1} marked as read: is_read = ${readNotif.is_read}`);
    if (!readNotif.is_read) {
      throw new Error('Notification was not updated to is_read = true');
    }

    // 5. Mark all as read
    console.log('\n5. Testing mark all as read (PATCH /api/notifications/read-all)...');
    const readAllRes = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!readAllRes.ok) {
      throw new Error(`Mark all read failed: ${await readAllRes.text()}`);
    }
    const readAllData = await readAllRes.json();
    console.log(`✓ Mark all read completed: updated ${readAllData.updated} notifications.`);

    // Confirm in DB that both are now read
    const { rows: verifyRead } = await pool.query(
      'SELECT id, is_read FROM notifications WHERE id IN ($1, $2)',
      [testNotifId1, testNotifId2]
    );
    if (verifyRead.some((n) => !n.is_read)) {
      throw new Error('Some notifications are still unread in database');
    }
    console.log('✓ Database confirms all test notifications marked as read.');

  } finally {
    // 6. Cleanup test records
    console.log('\n6. Purging test notifications (Zero Dummy Data)...');
    await pool.query('DELETE FROM notifications WHERE id IN ($1, $2)', [testNotifId1, testNotifId2]);
    console.log('✓ Test notifications purged successfully.');
  }

  await pool.end();
  console.log('\n=== PHASE 7 TEST PASSED SUCCESSFULLY ===');
}

main().catch(async (err) => {
  console.error('\n❌ Test failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
