/**
 * Phase 4 Test: WhatsApp Inquiry Integration Verification
 *
 * Verifies:
 * 1. POST /api/enquiries/whatsapp records an enquiry in the database.
 * 2. Creates a matching 'whatsapp_inquiry_click' entry in customer_activities.
 * 3. Returns the official GrowLocal WhatsApp link (https://wa.me/message/YYPIT2XYSY5WD1).
 * 4. Verifies the enquiry appears via admin endpoint /api/admin/enquiries with the lead status.
 * 5. Cleans up test records completely so no fake data remains.
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
  console.log('--- Testing Phase 4: WhatsApp Inquiry Integration ---');

  // Clean any leftovers from aborted test attempts
  await pool.query("DELETE FROM customer_activities WHERE activity_type = 'whatsapp_inquiry_click' AND product_name = 'black over size shirt'");
  await pool.query("DELETE FROM enquiries WHERE message LIKE '%WhatsApp Inquiry for black over size shirt%'");

  // 1. Fetch an existing active product from DB to test with
  const { rows: products } = await pool.query(
    "SELECT id, name, price, shop_id FROM products WHERE approval_status = 'approved' LIMIT 1"
  );
  if (products.length === 0) {
    throw new Error('No active products found in DB for testing.');
  }
  const testProduct = products[0];
  console.log(`Using test product: "${testProduct.name}" (ID: ${testProduct.id}, Price: ₹${testProduct.price})`);

  // 2. Fetch an existing customer from DB to simulate authenticated inquiry
  const { rows: customers } = await pool.query(
    "SELECT id, full_name, email, phone FROM customers LIMIT 1"
  );
  const testCustomer = customers[0] || null;
  console.log(`Using customer: ${testCustomer ? `${testCustomer.full_name} (${testCustomer.email})` : 'Anonymous visitor'}`);

  // 3. Make POST request to /api/enquiries/whatsapp
  console.log('\n1. Sending POST /api/enquiries/whatsapp...');
  const payload = {
    productId: testProduct.id,
    productName: testProduct.name,
    productPrice: Number(testProduct.price),
    quantity: 2,
    customerId: testCustomer ? testCustomer.id : undefined,
    customerName: testCustomer ? testCustomer.full_name : 'Test Visitor',
    customerPhone: testCustomer ? testCustomer.phone : '9876543210',
    customerEmail: testCustomer ? testCustomer.email : 'visitor@example.com',
  };

  const response = await fetch(`${API_BASE}/enquiries/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`POST /api/enquiries/whatsapp failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('API Response:', JSON.stringify(result, null, 2));

  // Check URL
  const expectedUrl = 'https://wa.me/message/YYPIT2XYSY5WD1';
  if (result.whatsappUrl !== expectedUrl) {
    throw new Error(`Expected whatsappUrl to be "${expectedUrl}", got "${result.whatsappUrl}"`);
  }
  console.log('✓ Correct official WhatsApp destination URL returned.');

  const enquiryId = result.enquiry?.id;
  if (!enquiryId) {
    throw new Error('Enquiry ID missing from API response');
  }

  // 4. Verify enquiry record in database
  console.log('\n2. Verifying enquiry in DB...');
  const { rows: enquiryRows } = await pool.query(
    'SELECT * FROM enquiries WHERE id = $1',
    [enquiryId]
  );
  if (enquiryRows.length === 0) {
    throw new Error(`Enquiry ${enquiryId} not found in DB`);
  }
  const dbEnquiry = enquiryRows[0];
  console.log(`✓ Enquiry verified in DB: Ref #${dbEnquiry.enquiry_code}, Status: ${dbEnquiry.status}, Message: "${dbEnquiry.message}"`);

  // 5. Verify customer_activities record
  console.log('\n3. Verifying customer_activities record in DB...');
  const { rows: activityRows } = await pool.query(
    "SELECT * FROM customer_activities WHERE activity_type = 'whatsapp_inquiry_click' AND (metadata->>'enquiryId')::text = $1",
    [enquiryId]
  );
  if (activityRows.length === 0) {
    throw new Error(`Matching customer_activities row not found for enquiry ${enquiryId}`);
  }
  const dbActivity = activityRows[0];
  console.log(`✓ Activity verified: Type: ${dbActivity.activity_type}, Customer: ${dbActivity.customer_name}, Product: ${dbActivity.product_name}, Qty: ${dbActivity.quantity}, Price: ₹${dbActivity.product_price}`);

  // 6. Test Admin inquiries endpoint with Admin login
  console.log('\n4. Verifying admin enquiries endpoint...');
  const adminLoginRes = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@growlocal.in',
      password: 'Password123!'
    })
  });
  if (!adminLoginRes.ok) {
    throw new Error(`Admin login failed: ${await adminLoginRes.text()}`);
  }
  const { accessToken } = await adminLoginRes.json();

  const adminEnquiriesRes = await fetch(`${API_BASE}/admin/enquiries?limit=10`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!adminEnquiriesRes.ok) {
    throw new Error(`Admin list enquiries failed: ${await adminEnquiriesRes.text()}`);
  }
  const adminEnquiries = await adminEnquiriesRes.json();
  const foundInAdmin = adminEnquiries.enquiries?.find(e => e.id === enquiryId);
  if (!foundInAdmin) {
    throw new Error(`Enquiry ${enquiryId} not returned in admin enquiries list`);
  }
  console.log(`✓ Enquiry found in admin enquiries list: Ref #${foundInAdmin.enquiry_code}, Product: ${foundInAdmin.product_name}`);

  // 7. Clean up test records
  console.log('\n5. Cleaning up test records to preserve zero dummy data policy...');
  await pool.query('DELETE FROM customer_activities WHERE (metadata->>\'enquiryId\')::text = $1', [enquiryId]);
  await pool.query('DELETE FROM enquiries WHERE id = $1', [enquiryId]);
  console.log('✓ Test records cleaned up successfully.');

  await pool.end();
  console.log('\n=== PHASE 4 TEST PASSED SUCCESSFULLY ===');
}

main().catch(async (err) => {
  console.error('\n❌ Test failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
