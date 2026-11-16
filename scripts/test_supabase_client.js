import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase Client connection...');
console.log('URL:', url);
console.log('Anon key exists:', !!anonKey);

const supabase = createClient(url, anonKey);

async function testSupabase() {
  // 1. Fetch categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('*').limit(3);
  console.log('\nCategories via Supabase:', categories?.length, catErr || 'OK');

  // 2. Fetch products
  const { data: products, error: prodErr } = await supabase.from('products').select('id, name, price, approval_status').limit(3);
  console.log('Products via Supabase:', products?.length, prodErr || 'OK');

  // 3. Test storage bucket listing
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Storage buckets list:', buckets?.map(b => b.name), bErr || 'OK');

  // 4. Test storage upload permission in product-images
  const testFile = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
  const { data: upData, error: upErr } = await supabase.storage.from('product-images').upload('test-permission.jpg', testFile, { upsert: true });
  console.log('Storage upload test in product-images:', upData, upErr ? upErr.message : 'OK');
  if (upData) {
    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl('test-permission.jpg');
    console.log('Public URL:', publicUrlData.publicUrl);
    await supabase.storage.from('product-images').remove(['test-permission.jpg']);
  }
}

testSupabase().catch(console.error);
