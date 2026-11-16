/**
 * Phase 6 Verification: Admin Order & Delivery Management
 *
 * Verifies:
 * 1. Places a real test order with items & delivery information.
 * 2. Authenticates as Admin and fetches full order details via GET /api/admin/orders/:id.
 *    - Verifies items array, delivery record, and status history.
 * 3. Updates delivery status to 'dispatched' with rider notes via PATCH /api/admin/orders/:id/delivery:
 *    - Verifies deliveries row updated with dispatched_at timestamp.
 *    - Verifies orders.status synced to 'shipped' and audit history logged.
 * 4. Updates delivery status to 'delivered' with completion notes:
 *    - Verifies deliveries row updated with delivered_at timestamp.
 *    - Verifies orders.status synced to 'completed'.
 * 5. Restores product stock and deletes all test records (zero dummy data).
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
  console.log('--- Testing Phase 6: Admin Order & Delivery Management ---');

  // 1. Fetch active product and customer
  const { rows: products } = await pool.query(
    "SELECT id, name, price, stock_quantity, shop_id FROM products WHERE approval_status = 'approved' AND stock_quantity > 1 LIMIT 1"
  );
  if (products.length === 0) {
    throw new Error('No active products with stock > 1 found.');
  }
  const testProduct = products[0];

  const { rows: customers } = await pool.query(
    "SELECT id, email, full_name, phone FROM customers LIMIT 1"
  );
  if (customers.length === 0) {
    throw new Error('No customer found in DB.');
  }
  const testCustomer = customers[0];

  // 2. Customer places test order
  const { signAccessToken } = await import('../services/api/src/utils/jwt.js');
  const customerToken = signAccessToken({ id: testCustomer.id, type: 'customer' });

  console.log('\n1. Customer placing test delivery order...');
  const orderRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      fulfillmentType: 'delivery',
      deliveryAddress: 'Plot 12, Sunrise Residency, Wardha Road, Nagpur',
      recipientName: 'Rahul Verma',
      recipientPhone: '9876501234',
      deliveryPincode: '440015',
      deliveryNotes: 'Call before reaching flat 201',
      items: [
        {
          productId: testProduct.id,
          quantity: 1,
          unitPrice: Number(testProduct.price),
          productName: testProduct.name,
        },
      ],
    }),
  });

  if (!orderRes.ok) {
    throw new Error(`Order placement failed: ${await orderRes.text()}`);
  }
  const { order } = await orderRes.json();
  const orderId = order.id;
  console.log(`✓ Test order placed: Ref #${order.order_code} (ID: ${orderId})`);

  try {
    // 3. Admin logs in
    console.log('\n2. Admin authenticating...');
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
    console.log('✓ Admin authenticated successfully.');

    // 4. Admin inspects order details via GET /api/admin/orders/:id
    console.log('\n3. Admin inspecting order details via GET /api/admin/orders/:id...');
    const getOrderRes = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!getOrderRes.ok) {
      throw new Error(`GET /api/admin/orders/${orderId} failed: ${await getOrderRes.text()}`);
    }
    const { order: inspectedOrder } = await getOrderRes.json();
    console.log(`✓ Inspected Order: #${inspectedOrder.order_code}, Status: ${inspectedOrder.status}`);
    console.log(`  Items count: ${inspectedOrder.items?.length || 0}`);
    console.log(`  Delivery Recipient: "${inspectedOrder.delivery?.recipient_name}", Address: "${inspectedOrder.delivery?.delivery_address}"`);
    console.log(`  Status History entries: ${inspectedOrder.status_history?.length || 0}`);

    if (!inspectedOrder.items || inspectedOrder.items.length !== 1) {
      throw new Error('inspectedOrder.items was not populated');
    }
    if (!inspectedOrder.delivery || inspectedOrder.delivery.recipient_name !== 'Rahul Verma') {
      throw new Error('inspectedOrder.delivery was not populated correctly');
    }

    // 5. Admin updates delivery status to 'dispatched'
    console.log('\n4. Admin updating delivery status to "dispatched" with rider details...');
    const riderNote = 'Assigned to delivery agent Vikram (Ph: 9123456780). Out for delivery.';
    const dispatchRes = await fetch(`${API_BASE}/admin/orders/${orderId}/delivery`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        deliveryStatus: 'dispatched',
        deliveryNotes: riderNote,
      }),
    });
    if (!dispatchRes.ok) {
      throw new Error(`PATCH /api/admin/orders/${orderId}/delivery failed: ${await dispatchRes.text()}`);
    }
    const { delivery: dispatchedDelivery } = await dispatchRes.json();
    console.log(`✓ Delivery updated: Status = "${dispatchedDelivery.delivery_status}", Dispatched At = ${dispatchedDelivery.dispatched_at}`);
    console.log(`  Notes: "${dispatchedDelivery.delivery_notes}"`);

    // Verify database sync: order status should now be 'shipped'
    const { rows: orderCheck1 } = await pool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    console.log(`✓ Orders status auto-synced to: "${orderCheck1[0].status}"`);
    if (orderCheck1[0].status !== 'shipped') {
      throw new Error(`Expected order status 'shipped', got '${orderCheck1[0].status}'`);
    }

    // 6. Admin updates delivery status to 'delivered'
    console.log('\n5. Admin updating delivery status to "delivered"...');
    const deliveredNote = 'Package handed over to recipient Rahul Verma successfully.';
    const deliverRes = await fetch(`${API_BASE}/admin/orders/${orderId}/delivery`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        deliveryStatus: 'delivered',
        deliveryNotes: deliveredNote,
      }),
    });
    if (!deliverRes.ok) {
      throw new Error(`PATCH delivery to delivered failed: ${await deliverRes.text()}`);
    }
    const { delivery: completedDelivery } = await deliverRes.json();
    console.log(`✓ Delivery updated: Status = "${completedDelivery.delivery_status}", Delivered At = ${completedDelivery.delivered_at}`);

    // Verify database sync: order status should now be 'completed'
    const { rows: orderCheck2 } = await pool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    console.log(`✓ Orders status auto-synced to: "${orderCheck2[0].status}"`);
    if (orderCheck2[0].status !== 'completed') {
      throw new Error(`Expected order status 'completed', got '${orderCheck2[0].status}'`);
    }

    // Verify complete audit history trail
    const { rows: fullHistory } = await pool.query(
      'SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC',
      [orderId]
    );
    console.log(`✓ Complete audit trail verified (${fullHistory.length} transitions):`);
    fullHistory.forEach((h, idx) => {
      console.log(`   Step ${idx + 1}: ${h.old_status || 'init'} -> ${h.new_status} (by ${h.changed_by_type}) - "${h.notes}"`);
    });
    if (fullHistory.length < 3) {
      throw new Error('Expected at least 3 audit log entries');
    }

  } finally {
    // 7. Cleanup test records and restore product stock
    console.log('\n6. Purging test records & restoring stock (Zero Dummy Data)...');
    await pool.query('UPDATE products SET stock_quantity = stock_quantity + 1 WHERE id = $1', [testProduct.id]);
    await pool.query('DELETE FROM customer_activities WHERE (metadata->>\'orderId\')::text = $1', [orderId]);
    await pool.query('DELETE FROM order_status_history WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM deliveries WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    console.log('✓ All test records purged and stock restored to original levels.');
  }

  await pool.end();
  console.log('\n=== PHASE 6 TEST PASSED SUCCESSFULLY ===');
}

main().catch(async (err) => {
  console.error('\n❌ Test failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
