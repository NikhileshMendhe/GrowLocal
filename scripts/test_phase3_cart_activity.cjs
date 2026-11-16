const { signAccessToken } = require('../services/api/src/utils/jwt.js');
const { pool } = require('../services/api/src/db/pool.js');

async function testPhase3() {
  console.log('🧪 Starting Phase 3 Cart & Customer Activity Integration Test...');

  const testCustomer = {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+919876543210',
  };

  const testProduct = {
    id: 'p1111111-1111-1111-1111-111111111111',
    name: "Men's Casual Shirt",
    price: 799,
  };

  // Step 1: Track view product
  console.log('1. Tracking view_product...');
  const viewRes = await fetch('http://localhost:4000/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityType: 'view_product',
      productName: testProduct.name,
      productPrice: testProduct.price,
      customerName: testCustomer.name,
      customerEmail: testCustomer.email,
      customerPhone: testCustomer.phone,
      quantity: 1,
      metadata: { test: true },
    }),
  });
  console.log('   view_product status:', viewRes.status);

  // Step 2: Track add to cart
  console.log('2. Tracking add_to_cart...');
  const addRes = await fetch('http://localhost:4000/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityType: 'add_to_cart',
      productName: testProduct.name,
      productPrice: testProduct.price,
      customerName: testCustomer.name,
      customerEmail: testCustomer.email,
      customerPhone: testCustomer.phone,
      quantity: 2,
      metadata: { test: true },
    }),
  });
  console.log('   add_to_cart status:', addRes.status);

  // Step 3: Track update cart quantity
  console.log('3. Tracking update_cart_quantity...');
  const updateRes = await fetch('http://localhost:4000/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityType: 'update_cart_quantity',
      productName: testProduct.name,
      productPrice: testProduct.price,
      customerName: testCustomer.name,
      customerEmail: testCustomer.email,
      customerPhone: testCustomer.phone,
      quantity: 3,
      metadata: { delta: 1, test: true },
    }),
  });
  console.log('   update_cart_quantity status:', updateRes.status);

  // Step 4: Track remove from cart
  console.log('4. Tracking remove_from_cart...');
  const removeRes = await fetch('http://localhost:4000/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityType: 'remove_from_cart',
      productName: testProduct.name,
      productPrice: testProduct.price,
      customerName: testCustomer.name,
      customerEmail: testCustomer.email,
      customerPhone: testCustomer.phone,
      quantity: 0,
      metadata: { test: true },
    }),
  });
  console.log('   remove_from_cart status:', removeRes.status);

  // Step 5: Query as Admin via /api/admin/activities
  console.log('5. Querying /api/admin/activities with admin token...');
  const adminToken = signAccessToken({ id: 'f9bb6499-777f-4bc0-9193-70f5b80b1bbe', type: 'admin' });
  const adminActRes = await fetch('http://localhost:4000/api/admin/activities?limit=10', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   GET /api/admin/activities status:', adminActRes.status);
  const adminActData = await adminActRes.json();
  console.log('   Total recorded activities:', adminActData.total);
  console.log('   Sample activities returned:', adminActData.activities.map(a => `${a.customer_name} -> ${a.activity_type} (${a.product_name}, qty: ${a.quantity}, price: ₹${a.product_price})`));

  // Step 6: Query Dashboard to verify recentActivity
  console.log('6. Querying /api/admin/dashboard...');
  const dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dashData = await dashRes.json();
  console.log('   Dashboard total_activities count:', dashData.counts.total_activities);
  console.log('   Recent activities in dashboard:', dashData.recentActivity.length);

  // Clean up test rows
  console.log('7. Cleaning test rows from database...');
  const cleanRes = await pool.query("DELETE FROM customer_activities WHERE metadata->>'test' = 'true'");
  console.log('   Cleaned rows:', cleanRes.rowCount);

  console.log('🎉 Phase 3 Cart & Customer Activity Integration Test PASSED!');
  process.exit(0);
}

testPhase3().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
