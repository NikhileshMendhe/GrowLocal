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

async function run() {
  console.log('--- TESTING ADMIN PRODUCT DELETION & LIVE INQUIRY FEATURES ---');

  // 1. Log in as admin
  console.log('1. Logging in as admin...');
  const loginRes = await request(
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

  if (loginRes.status !== 200) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const adminToken = loginRes.body.accessToken || loginRes.body.token;
  console.log('✓ Admin authenticated.');

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  // 2. Create a test product to test deletion
  console.log('\n2. Creating a test product for deletion...');
  const createRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/products',
      method: 'POST',
      headers: adminHeaders,
    },
    {
      name: 'Deletion Test Organic Apples ' + Date.now(),
      price: 199,
      description: 'Test product for deletion verification',
      availabilityStatus: 'In Stock',
      stockQuantity: 20,
    }
  );

  console.log('Product created status:', createRes.status);
  const prodId = createRes.body.product?.id;
  if (!prodId) throw new Error('Product creation failed: ' + JSON.stringify(createRes.body));
  console.log('✓ Product created with ID:', prodId);

  // 3. Test deleting the product as Admin
  console.log('\n3. Testing DELETE /api/products/' + prodId + '...');
  const deleteRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/products/${prodId}`,
    method: 'DELETE',
    headers: adminHeaders,
  });

  console.log('Delete status:', deleteRes.status);
  if (deleteRes.status !== 204) {
    throw new Error('Delete failed with status: ' + deleteRes.status);
  }
  console.log('✓ Product successfully deleted.');

  // Verify it is no longer returned in admin product list
  const listRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/products?q=Deletion+Test',
    method: 'GET',
    headers: adminHeaders,
  });

  const remaining = (listRes.body.products || []).filter((p) => p.id === prodId);
  if (remaining.length > 0) {
    throw new Error('Product still found in admin product list after deletion!');
  }
  console.log('✓ Confirmed: Deleted product is removed from product listings.');

  // 4. Test WhatsApp Inquiry Logging
  console.log('\n4. Testing customer WhatsApp Inquiry logging (POST /api/enquiries/whatsapp)...');
  const inquiryRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/enquiries/whatsapp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      productName: 'Fresh Organic Mangoes',
      quantity: 3,
      customerName: 'Priya Sharma',
      customerPhone: '+919876543210',
      message: 'Hi GrowLocal, I would like to buy 3 kg of Fresh Organic Mangoes. Is it available for delivery?',
      totalAmount: 599,
      origin: 'whatsapp_product',
    }
  );

  console.log('Inquiry logged status:', inquiryRes.status);
  const enquiry = inquiryRes.body.enquiry;
  if (!enquiry || !enquiry.id) {
    throw new Error('Inquiry logging failed: ' + JSON.stringify(inquiryRes.body));
  }
  console.log('✓ WhatsApp Inquiry logged with code:', enquiry.enquiry_code);

  // 5. Test that Admin Panel can read this inquiry
  console.log('\n5. Checking that inquiry appears in Admin Inquiries list (/api/admin/enquiries)...');
  const adminEnqRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/enquiries?limit=10',
    method: 'GET',
    headers: adminHeaders,
  });

  console.log('Admin enquiries status:', adminEnqRes.status);
  const enquiries = adminEnqRes.body.enquiries || [];
  const found = enquiries.find((e) => e.id === enquiry.id);
  if (!found) {
    throw new Error('Logged inquiry was not found in Admin inquiries feed!');
  }
  console.log('✓ Found logged inquiry in admin feed:', {
    code: found.enquiry_code,
    customer: found.customer_name,
    message: found.message,
    status: found.status,
  });

  // 6. Test Admin updating Inquiry Status (e.g. marked as Responded)
  console.log('\n6. Testing Admin updating inquiry status to "responded"...');
  const updateEnqRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/admin/enquiries/${enquiry.id}/status`,
      method: 'PATCH',
      headers: adminHeaders,
    },
    { status: 'responded' }
  );

  console.log('Status update result:', updateEnqRes.status);
  if (updateEnqRes.status !== 200) {
    throw new Error('Failed to update enquiry status: ' + JSON.stringify(updateEnqRes.body));
  }
  console.log('✓ Inquiry status successfully updated to "responded" by Admin.');

  console.log('\n🎉 ALL TESTS PASSED! Product Deletion & Customer Inquiry features fully verified.');
}

run().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
