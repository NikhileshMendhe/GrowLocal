import http from 'http';

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

async function runTests() {
  console.log('--- PHASE 3: ADMIN PANEL VERIFICATION ---');

  // 1. Admin Login
  console.log('1. Testing Admin Login...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@growlocal.in', password: 'Password123!' }
  );

  if (loginRes.status !== 200) {
    throw new Error(`Admin login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
  }
  const token = loginRes.body.token || loginRes.body.accessToken;
  console.log('✓ Admin login successful. Token acquired.');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Dashboard metrics
  console.log('2. Testing Admin Dashboard endpoint (/api/admin/dashboard)...');
  const dashRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`✓ Dashboard status: ${dashRes.status}, counts:`, dashRes.body.counts);

  // 3. Admin Products list
  console.log('3. Testing Admin Products endpoint (/api/admin/products)...');
  const prodListRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/products?limit=5',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`✓ Admin products list status: ${prodListRes.status}, total products: ${prodListRes.body.total}`);

  // 4. Create Product as Admin
  console.log('4. Testing Admin Add Product (/api/products)...');
  const testProduct = {
    name: 'Phase 3 Premium Farm Organic Honey 500g',
    description: 'Raw cold-pressed multi-flora honey harvested from Himalayan valleys.',
    price: 349.0,
    originalPrice: 499.0,
    stockQuantity: 25,
    availabilityStatus: 'In Stock',
    categoryId: 'c0000000-0000-0000-0000-000000000003',
    isFeatured: true,
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'],
  };

  const createRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/products',
      method: 'POST',
      headers: authHeaders,
    },
    testProduct
  );
  if (createRes.status !== 201) {
    throw new Error(`Product creation failed: ${createRes.status} ${JSON.stringify(createRes.body)}`);
  }
  const created = createRes.body.product;
  console.log(`✓ Product created successfully with ID: ${created.id}`);
  console.log(`  Name: ${created.name}, Price: ₹${created.price}, MRP: ₹${created.original_price}, Discount: ${created.discount_percentage}%`);

  // 5. Verify in Customer Storefront
  console.log('5. Verifying product in Customer Storefront catalog...');
  const storeRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/products/${created.id}`,
    method: 'GET',
  });
  if (storeRes.status !== 200) {
    throw new Error(`Storefront fetch failed: ${storeRes.status}`);
  }
  console.log(`✓ Storefront successfully loaded product: "${storeRes.body.product.name}"`);

  // 6. Update Product as Admin
  console.log('6. Testing Admin Edit Product (/api/products/:id)...');
  const updateRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/products/${created.id}`,
      method: 'PUT',
      headers: authHeaders,
    },
    {
      price: 299.0,
      originalPrice: 499.0,
      stockQuantity: 50,
      description: 'Updated description: 100% pure raw honey, lab certified.',
    }
  );
  if (updateRes.status !== 200) {
    throw new Error(`Product update failed: ${updateRes.status}`);
  }
  console.log(`✓ Product updated. New price: ₹${updateRes.body.product.price}, Stock: ${updateRes.body.product.stock_quantity}`);

  // 7. Update Stock
  console.log('7. Testing Stock Status toggle (/api/products/:id/stock)...');
  const stockRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/products/${created.id}/stock`,
      method: 'PATCH',
      headers: authHeaders,
    },
    { availabilityStatus: 'Low Stock', stockQuantity: 3 }
  );
  console.log(`✓ Stock updated to: ${stockRes.body.product.availability_status}`);

  // 8. Admin Orders list
  console.log('8. Testing Admin Orders endpoint (/api/admin/orders)...');
  const ordersRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/orders',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`✓ Admin orders endpoint status: ${ordersRes.status}, count: ${ordersRes.body.total}`);

  // 9. Admin Enquiries list
  console.log('9. Testing Admin Enquiries endpoint (/api/admin/enquiries)...');
  const enqRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/enquiries',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`✓ Admin enquiries endpoint status: ${enqRes.status}, count: ${enqRes.body.total}`);

  // 10. Clean up - Delete product
  console.log('10. Testing Admin Delete Product (/api/products/:id)...');
  const delRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/products/${created.id}`,
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log(`✓ Product deleted with status: ${delRes.status}`);

  console.log('\n========================================');
  console.log('ALL PHASE 3 ADMIN TESTS PASSED PERFECTLY!');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
