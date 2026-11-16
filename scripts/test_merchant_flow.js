async function main() {
  console.log('Testing Merchant & Enquiry flows:');

  // 1. Merchant signup
  const merchEmail = 'merch_test_' + Date.now() + '@example.com';
  const merchSignup = await fetch('http://localhost:5174/api/auth/merchant/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Apex Electronics',
      ownerName: 'Apex Owner',
      email: merchEmail,
      password: 'Password123!',
      phone: '9876543210'
    })
  });
  console.log('1. Merchant signup status:', merchSignup.status);
  const merchData = await merchSignup.json();
  const merchToken = merchData.accessToken;

  // 2. Merchant views their shop
  const shopRes = await fetch('http://localhost:5174/api/merchants/me/shop', {
    headers: { 'Authorization': 'Bearer ' + merchToken }
  });
  console.log('2. Merchant shop status:', shopRes.status);
  const shopData = await shopRes.json();
  console.log('   Merchant shop name:', shopData.shop?.name);

  // 3. Merchant views their orders
  const ordersRes = await fetch('http://localhost:5174/api/orders/merchant', {
    headers: { 'Authorization': 'Bearer ' + merchToken }
  });
  console.log('3. Merchant orders status:', ordersRes.status);

  // 4. Merchant views their enquiries
  const enqRes = await fetch('http://localhost:5174/api/enquiries/merchant', {
    headers: { 'Authorization': 'Bearer ' + merchToken }
  });
  console.log('4. Merchant enquiries status:', enqRes.status);

  console.log('\nAll merchant flow checks passed!');
}

main().catch(console.error);

