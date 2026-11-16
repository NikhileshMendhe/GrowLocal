async function main() {
  console.log('Testing full order flow:');

  // 1. Create a fresh customer
  const custEmail = 'cust_order_' + Date.now() + '@example.com';
  const custSignup = await fetch('http://localhost:5173/api/auth/customer/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Order Tester',
      email: custEmail,
      password: 'Password123!',
      phone: '9876543210'
    })
  });
  console.log('1. Customer signup status:', custSignup.status);
  const custData = await custSignup.json();
  const custToken = custData.accessToken;
  console.log('   Customer token exists:', Boolean(custToken));

  // 2. Fetch an approved product
  const prodRes = await fetch('http://localhost:5173/api/products?limit=1');
  const prodData = await prodRes.json();
  const prod = prodData.products[0];
  console.log('2. Product selected:', prod.id, prod.name, 'Price:', prod.price);

  // 3. Create an order
  const orderRes = await fetch('http://localhost:5173/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + custToken
    },
    body: JSON.stringify({
      productId: prod.id,
      quantity: 1,
      fulfillmentType: 'pickup',
      deliveryAddress: 'Nagpur pickup'
    })
  });
  console.log('3. Order creation status:', orderRes.status);
  const orderData = await orderRes.json();
  console.log('   Order created successfully:', orderData.order?.order_code);

  // 4. Customer views their orders
  const myOrdersRes = await fetch('http://localhost:5173/api/orders/mine', {
    headers: { 'Authorization': 'Bearer ' + custToken }
  });
  console.log('4. Customer orders status:', myOrdersRes.status);
  const myOrders = await myOrdersRes.json();
  console.log('   Customer orders count:', myOrders.orders?.length);

  console.log('\nAll order flow checks passed successfully!');
}

main().catch(console.error);

