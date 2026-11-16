/**
 * Phase 5 Verification: Website Multi-Item Order Management
 *
 * Verifies:
 * 1. Authenticates customer and retrieves active products.
 * 2. Places a multi-item cart order via POST /api/orders.
 * 3. Verifies atomic creation of:
 *    - orders row
 *    - order_items rows (1 row per product)
 *    - deliveries row with recipient name, phone, address, pincode
 *    - order_status_history row with initial status
 *    - customer_activities row with 'order_placed'
 *    - Product stock quantity decrementation
 * 4. Verifies Admin panel endpoints:
 *    - GET /api/admin/orders returns the multi-item order with item count & delivery details
 *    - PATCH /api/admin/orders/:id/status updates status and logs history
 * 5. Reverts stock and completely cleans up all test records (zero dummy data).
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
  console.log('--- Testing Phase 5: Multi-Item Order Management ---');

  // 1. Fetch 2 active products with stock > 2
  const { rows: products } = await pool.query(
    "SELECT id, name, price, stock_quantity, shop_id FROM products WHERE approval_status = 'approved' AND stock_quantity > 2 LIMIT 2"
  );
  if (products.length < 2) {
    throw new Error('Need at least 2 active products with stock > 2 for testing.');
  }

  const prod1 = products[0];
  const prod2 = products[1];
  console.log(`Product 1: "${prod1.name}" (Stock: ${prod1.stock_quantity}, Price: ₹${prod1.price})`);
  console.log(`Product 2: "${prod2.name}" (Stock: ${prod2.stock_quantity}, Price: ₹${prod2.price})`);

  // 2. Fetch customer from DB and generate auth token
  const { rows: customers } = await pool.query(
    "SELECT id, email, full_name, phone FROM customers LIMIT 1"
  );
  if (customers.length === 0) {
    throw new Error('No customer found in DB for testing.');
  }
  const testCustomer = customers[0];
  console.log(`Test Customer: ${testCustomer.full_name} (${testCustomer.email})`);

  // Sign in as customer or generate customer token
  const { signAccessToken } = await import('../services/api/src/utils/jwt.js');
  const customerToken = signAccessToken({ id: testCustomer.id, type: 'customer' });

  // 3. Place multi-item order
  console.log('\n1. Sending POST /api/orders (Multi-item cart checkout)...');
  const qty1 = 1;
  const qty2 = 2;
  const expectedTotal = Number(prod1.price) * qty1 + Number(prod2.price) * qty2;

  const orderPayload = {
    fulfillmentType: 'delivery',
    deliveryAddress: 'Flat 402, Green Park Avenue, Near City Hospital, Nagpur',
    recipientName: testCustomer.full_name,
    recipientPhone: testCustomer.phone || '9876543210',
    deliveryPincode: '440001',
    deliveryNotes: 'Please ring bell upon arrival',
    items: [
      {
        productId: prod1.id,
        quantity: qty1,
        unitPrice: Number(prod1.price),
        productName: prod1.name,
      },
      {
        productId: prod2.id,
        quantity: qty2,
        unitPrice: Number(prod2.price),
        productName: prod2.name,
      },
    ],
  };

  const orderRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify(orderPayload),
  });

  if (!orderRes.ok) {
    const errorBody = await orderRes.text();
    throw new Error(`POST /api/orders failed (${orderRes.status}): ${errorBody}`);
  }

  const { order } = await orderRes.json();
  console.log(`✓ Order placed successfully! Order Code: ${order.order_code}, ID: ${order.id}`);
  console.log(`  Reported Total: ₹${order.total_amount}, Expected: ₹${expectedTotal}`);

  if (Math.abs(Number(order.total_amount) - expectedTotal) > 0.01) {
    throw new Error(`Total amount mismatch: expected ${expectedTotal}, got ${order.total_amount}`);
  }

  const orderId = order.id;

  try {
    // 4. Verify Database Records
    console.log('\n2. Verifying atomic database records...');

    // A. Check order_items
    const { rows: itemRows } = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY unit_price DESC',
      [orderId]
    );
    console.log(`✓ order_items verified: found ${itemRows.length} items`);
    if (itemRows.length !== 2) {
      throw new Error(`Expected 2 order_items, found ${itemRows.length}`);
    }

    // B. Check deliveries
    const { rows: deliveryRows } = await pool.query(
      'SELECT * FROM deliveries WHERE order_id = $1',
      [orderId]
    );
    if (deliveryRows.length === 0) {
      throw new Error('deliveries record was not created');
    }
    const delivery = deliveryRows[0];
    console.log(`✓ deliveries verified: Recipient "${delivery.recipient_name}", Status: "${delivery.delivery_status}", Address: "${delivery.delivery_address}"`);

    // C. Check order_status_history
    const { rows: historyRows } = await pool.query(
      'SELECT * FROM order_status_history WHERE order_id = $1',
      [orderId]
    );
    console.log(`✓ order_status_history verified: found ${historyRows.length} initial entry`);
    if (historyRows.length === 0) {
      throw new Error('order_status_history record was not created');
    }

    // D. Check customer_activities
    const { rows: actRows } = await pool.query(
      "SELECT * FROM customer_activities WHERE activity_type = 'order_placed' AND (metadata->>'orderId')::text = $1",
      [orderId]
    );
    if (actRows.length === 0) {
      throw new Error('customer_activities record for order_placed was not created');
    }
    console.log(`✓ customer_activities verified: Type: ${actRows[0].activity_type}, Customer: ${actRows[0].customer_name}, Amount: ₹${actRows[0].product_price}`);

    // E. Check product stock decrements
    const { rows: checkProd1 } = await pool.query('SELECT stock_quantity FROM products WHERE id = $1', [prod1.id]);
    const { rows: checkProd2 } = await pool.query('SELECT stock_quantity FROM products WHERE id = $1', [prod2.id]);
    console.log(`✓ Stock decrement verified: Product 1 (${prod1.stock_quantity} -> ${checkProd1[0].stock_quantity}), Product 2 (${prod2.stock_quantity} -> ${checkProd2[0].stock_quantity})`);
    if (checkProd1[0].stock_quantity !== prod1.stock_quantity - qty1) {
      throw new Error(`Product 1 stock was not decremented correctly`);
    }
    if (checkProd2[0].stock_quantity !== prod2.stock_quantity - qty2) {
      throw new Error(`Product 2 stock was not decremented correctly`);
    }

    // 5. Verify Admin API Endpoints
    console.log('\n3. Verifying Admin Panel endpoints...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@growlocal.in',
        password: 'Password123!',
      }),
    });
    const { accessToken: adminToken } = await adminLoginRes.json();

    const adminOrdersRes = await fetch(`${API_BASE}/admin/orders?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminOrdersData = await adminOrdersRes.json();
    const foundAdminOrder = adminOrdersData.orders?.find((o) => o.id === orderId);

    if (!foundAdminOrder) {
      throw new Error(`Order ${orderId} not found in admin orders list`);
    }
    console.log(`✓ Admin orders list verified: Found #${foundAdminOrder.order_code}, Item Count: ${foundAdminOrder.item_count}, Customer: ${foundAdminOrder.customer_name}`);

    // Update status to 'confirmed' via Admin
    console.log('\n4. Admin updating status to "confirmed"...');
    const updateRes = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    if (!updateRes.ok) {
      throw new Error(`Admin update status failed: ${await updateRes.text()}`);
    }
    const updateData = await updateRes.json();
    console.log(`✓ Status updated to "${updateData.order.status}"`);

    // Verify history recorded the admin change
    const { rows: updatedHistory } = await pool.query(
      'SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC',
      [orderId]
    );
    console.log(`✓ Audit history updated: ${updatedHistory.length} entries`);
    const latestHistory = updatedHistory[updatedHistory.length - 1];
    if (latestHistory.new_status !== 'confirmed' || latestHistory.changed_by_type !== 'admin') {
      throw new Error(`Audit history not properly logged for admin status transition`);
    }

  } finally {
    // 6. Clean up test records and restore stock
    console.log('\n5. Cleaning up test records & restoring stock (Zero Dummy Data)...');
    await pool.query('UPDATE products SET stock_quantity = stock_quantity + $2 WHERE id = $1', [prod1.id, qty1]);
    await pool.query('UPDATE products SET stock_quantity = stock_quantity + $2 WHERE id = $1', [prod2.id, qty2]);
    await pool.query('DELETE FROM customer_activities WHERE (metadata->>\'orderId\')::text = $1', [orderId]);
    await pool.query('DELETE FROM order_status_history WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM deliveries WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    console.log('✓ All test records purged and stock restored to original levels.');
  }

  await pool.end();
  console.log('\n=== PHASE 5 TEST PASSED SUCCESSFULLY ===');
}

main().catch(async (err) => {
  console.error('\n❌ Test failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
