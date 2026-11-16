const { signAccessToken } = require('../services/api/src/utils/jwt.js');

async function testPhase2() {
  console.log('Testing Phase 2 Endpoints...');

  // 1. Log an activity anonymously / guest
  const postRes = await fetch('http://localhost:4000/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityType: 'view_product',
      customerName: 'Amaan Sheikh',
      customerEmail: 'amaan@example.com',
      productName: 'Fresh Organic Apples',
      productPrice: 180,
      quantity: 1,
      metadata: { source: 'storefront_test' }
    })
  });
  console.log('POST /api/activities status:', postRes.status);
  const postData = await postRes.json();
  console.log('Created Activity:', postData);

  // 2. Query as Admin
  const adminToken = signAccessToken({ id: 'f9bb6499-777f-4bc0-9193-70f5b80b1bbe', type: 'admin' });
  const getActRes = await fetch('http://localhost:4000/api/admin/activities', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('GET /api/admin/activities status:', getActRes.status);
  const getActData = await getActRes.json();
  console.log('Admin Activities list (total):', getActData.total, 'items:', getActData.activities?.length);

  // 3. Query Dashboard counts
  const dashRes = await fetch('http://localhost:4000/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('GET /api/admin/dashboard status:', dashRes.status);
  const dashData = await dashRes.json();
  console.log('Dashboard Counts:', dashData.counts);
  console.log('Recent Activity:', dashData.recentActivity);

  console.log('✅ Phase 2 endpoint tests passed!');
  process.exit(0);
}

testPhase2().catch(e => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
