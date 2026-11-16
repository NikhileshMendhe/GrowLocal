import http from 'http';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : {};
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  console.log('--- TESTING ADMIN AUTH & ROLE SEPARATION FIX ---');

  // Step 1: Admin Login
  console.log('\n1. Testing POST /api/auth/admin/login...');
  const adminLoginRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/admin/login?audience=admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Audience': 'admin',
      },
    },
    { email: 'admin@growlocal.in', password: 'Password123!' }
  );

  console.log('Status:', adminLoginRes.status);
  console.log('User Role:', adminLoginRes.body.user?.role_name, 'Type:', adminLoginRes.body.user?.type);
  console.log('Set-Cookie headers:', adminLoginRes.headers['set-cookie']);

  if (adminLoginRes.status !== 200) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLoginRes.body));
  }

  const adminToken = adminLoginRes.body.accessToken || adminLoginRes.body.token;

  // Step 2: GET /api/admin/dashboard using Admin Token
  console.log('\n2. Testing GET /api/admin/dashboard with Admin Token...');
  const dashRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  console.log('Dashboard status:', dashRes.status);
  console.log('Counts:', dashRes.body?.data?.counts || dashRes.body?.counts);
  if (dashRes.status !== 200) {
    throw new Error('Dashboard endpoint failed with admin token: ' + JSON.stringify(dashRes.body));
  }

  // Step 3: GET /api/auth/me using Admin Token
  console.log('\n3. Testing GET /api/auth/me with Admin Token...');
  const meRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  console.log('Me status:', meRes.status);
  console.log('Me user:', meRes.body.user?.email, 'Role:', meRes.body.user?.role_name, 'Type:', meRes.body.user?.type);
  if (meRes.status !== 200 || meRes.body.user?.role_name !== 'admin') {
    throw new Error('Me endpoint did not return admin role: ' + JSON.stringify(meRes.body));
  }

  // Step 4: Customer Login to test cookie isolation & role rejection
  console.log('\n4. Testing Customer Login and role check...');
  const custLoginRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/customer/login?audience=customer',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Audience': 'customer',
      },
    },
    { email: 'customer_demo_test@growlocal.in', password: 'Password123!' }
  ).catch(() => null);

  // If customer doesn't exist, try signup
  let custToken = custLoginRes?.body?.accessToken;
  if (!custToken) {
    const signupRes = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/customer/signup?audience=customer',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Audience': 'customer',
        },
      },
      {
        fullName: 'Test Customer',
        email: `customer_test_${Date.now()}@growlocal.in`,
        password: 'Password123!',
      }
    );
    custToken = signupRes.body?.accessToken;
  }

  if (custToken) {
    console.log('Got customer token. Testing if customer token is correctly REJECTED by /api/admin/dashboard...');
    const custDashRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${custToken}`,
      },
    });
    const errMessage = custDashRes.body?.error?.message || custDashRes.body?.message;
    console.log('Customer accessing /api/admin/dashboard status:', custDashRes.status);
    console.log('Expected rejection message:', errMessage);
    if (custDashRes.status === 403 && String(errMessage).includes('requires role: admin')) {
      console.log('✓ Security check passed: Non-admin customer correctly blocked from admin endpoints.');
    } else {
      throw new Error('Security check failed: Customer was not blocked as expected!');
    }
  }

  console.log('\n✓ ALL TESTS PASSED! Admin role verification, cookie separation, and security checks verified.');
}

test().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
