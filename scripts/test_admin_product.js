import http from 'http';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  console.log('--- TESTING ADMIN PRODUCT CREATION & ACCESS ---');

  // 1. Admin login
  const loginRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin@growlocal.in',
    password: 'Password123!'
  });

  console.log('1. Admin login:', loginRes.status, loginRes.data.user ? 'OK' : loginRes.data);
  const token = loginRes.data.accessToken;

  // 2. Admin creates a product (NO shopId required!)
  const createRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    name: 'Admin Test Wireless Headphones',
    price: 1499,
    originalPrice: 2999,
    description: 'High quality wireless sound test product by admin',
    stockQuantity: 25,
    availabilityStatus: 'In Stock',
    isFeatured: true,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']
  });

  console.log('2. Admin product creation:', createRes.status, createRes.data.product ? 'OK' : createRes.data);
  const createdId = createRes.data?.product?.id;

  // 3. Fetch public products (no auth)
  const listRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products?limit=5',
    method: 'GET'
  });

  console.log('3. Public product list status:', listRes.status);
  const found = listRes.data?.products?.find(p => p.id === createdId);
  console.log('Found created product in public list?', !!found);
  if (found) {
    console.log('Product image_url attached?', found.image_url);
    console.log('Product discount_percentage:', found.discount_percentage + '%');
  }

  // 4. Clean up test product
  if (createdId) {
    const delRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: `/api/products/${createdId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('4. Admin deleted test product:', delRes.status);
  }

  console.log('--- TEST FINISHED SUCCESSFULLY ---');
}

test().catch(console.error);
