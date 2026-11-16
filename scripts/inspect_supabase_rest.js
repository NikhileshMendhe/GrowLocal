import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nydusjwdmmqtapfjhrpl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xELBZLeFdPxm2K9JNEJHDQ_NANo7OZQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const tables = [
  'categories',
  'locations',
  'merchants',
  'shops',
  'products',
  'enquiries',
  'reservations',
  'messages',
  'offers',
  'reviews',
  'saved_shops',
  'profiles',
  'creators',
  'campaigns'
];

async function inspectSupabaseData() {
  console.log('Connecting to Supabase via REST API...');
  for (const table of tables) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' });
      
      if (error) {
        console.log(`- ${table}: Error (${error.message})`);
      } else {
        console.log(`- ${table}: ${count ?? data?.length} rows`);
        if (data && data.length > 0) {
          console.log(`  Sample keys for ${table}:`, Object.keys(data[0]));
        }
      }
    } catch (err) {
      console.log(`- ${table}: Exception (${err.message})`);
    }
  }
}

inspectSupabaseData();
