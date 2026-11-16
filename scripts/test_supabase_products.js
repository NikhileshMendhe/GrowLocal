import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nydusjwdmmqtapfjhrpl.supabase.co',
  'sb_publishable_xELBZLeFdPxm2K9JNEJHDQ_NANo7OZQ'
);

async function test() {
  console.log('Fetching products with relations via Supabase JS client...');
  const { data, error } = await supabase
    .from('products')
    .select('*, shops(id, name, is_verified, address), categories(name), product_variants(size, price, stock_quantity, is_available), product_images(image_url, display_order)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Products returned:', data?.length);
    if (data?.length > 0) {
      console.log('Sample product:', data[0].name, 'Shop:', data[0].shops, 'Category:', data[0].categories);
    }
  }

  console.log('\nFetching shops via Supabase JS client...');
  const shopsRes = await supabase
    .from('shops')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });
  if (shopsRes.error) {
    console.error('Shops error:', shopsRes.error);
  } else {
    console.log('Shops returned:', shopsRes.data?.length);
    if (shopsRes.data?.length > 0) {
      console.log('Sample shop:', shopsRes.data[0].name);
    }
  }
}

test().catch(console.error);
