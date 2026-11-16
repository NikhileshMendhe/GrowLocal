import http from 'http';
import { buildProductInquiryMessage, buildCartInquiryMessage, buildWhatsAppUrl, OFFICIAL_WHATSAPP_SHORT_LINK } from '../apps/customer-web/src/lib/whatsapp.js';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- CUSTOMER AUTH & WHATSAPP INTEGRATION TESTS ---');

  // 1. Valid customer login
  console.log('1. Testing Valid Customer Login...');
  const validLogin = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/customer/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'customer@growlocal.in', password: 'Password123!' }
  );
  if (validLogin.status !== 200) {
    throw new Error(`Customer login failed: ${validLogin.status}`);
  }
  console.log(`✓ Customer login 200 OK. User: "${validLogin.body.user.full_name}"`);

  // 2. Invalid credentials
  console.log('2. Testing Invalid Credentials Handling...');
  const invalidLogin = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/customer/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'customer@growlocal.in', password: 'WrongPassword999!' }
  );
  if (invalidLogin.status !== 401) {
    throw new Error(`Expected 401 for bad password, got ${invalidLogin.status}`);
  }
  console.log('✓ Invalid credentials properly rejected with 401 Unauthorized.');

  // 3. Duplicate email handling
  console.log('3. Testing Duplicate Email Handling on Signup...');
  const dupSignup = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/customer/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      fullName: 'Duplicate Tester',
      email: 'customer@growlocal.in',
      password: 'Password123!',
    }
  );
  if (dupSignup.status !== 409) {
    throw new Error(`Expected 409 Conflict for duplicate email, got ${dupSignup.status}`);
  }
  console.log('✓ Duplicate signup properly rejected with 409 Conflict.');

  // 4. Fresh customer registration
  console.log('4. Testing Fresh Customer Registration...');
  const newEmail = `customer_${Date.now()}@growlocal.in`;
  const freshSignup = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/customer/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      fullName: 'Aarav Patel',
      email: newEmail,
      password: 'SecurePassword123!',
      phone: '+91 9123456789',
    }
  );
  if (freshSignup.status !== 201) {
    throw new Error(`Fresh signup failed with status ${freshSignup.status}`);
  }
  console.log(`✓ New customer registered with 201 Created. User ID: ${freshSignup.body.user.id}`);

  // 5. WhatsApp Message Builders
  console.log('5. Testing WhatsApp Message Formatting...');
  const sampleProduct = {
    name: 'Alphonso Mangoes 1 Dozen',
    price: 899,
  };
  const singleMsg = buildProductInquiryMessage(sampleProduct, 2);
  console.log('  Single product message sample:');
  console.log('  ' + singleMsg.split('\n').join('\n  '));

  const sampleCart = [
    { product: { name: 'Alphonso Mangoes 1 Dozen', price: 899 }, quantity: 1 },
    { product: { name: 'Fresh Farm Milk 1L', price: 68 }, quantity: 3 },
  ];
  const cartMsg = buildCartInquiryMessage(sampleCart, 899 + 68 * 3);
  console.log('\n  Cart consolidated message sample:');
  console.log('  ' + cartMsg.split('\n').join('\n  '));

  const url = buildWhatsAppUrl(cartMsg);
  console.log(`\n✓ Generated WhatsApp destination URL: ${url}`);
  if (!url.startsWith('https://wa.me/')) {
    throw new Error('Invalid WhatsApp URL generated');
  }

  console.log('\n=================================================');
  console.log('ALL CUSTOMER AUTH & WHATSAPP TESTS PASSED 100%!');
  console.log('=================================================');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
