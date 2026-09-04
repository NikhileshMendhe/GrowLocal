import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables (supporting Vite & Next.js conventions)
// Retrieve credentials from environment variables (supporting Vite, Node & Next.js conventions)
const envObj = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});

const supabaseUrl = 
  envObj.VITE_SUPABASE_URL || 
  envObj.NEXT_PUBLIC_SUPABASE_URL || 
  envObj.SUPABASE_URL ||
  'https://nydusjwdmmqtapfjhrpl.supabase.co';

const supabaseAnonKey = 
  envObj.VITE_SUPABASE_ANON_KEY || 
  envObj.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  envObj.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  envObj.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_xELBZLeFdPxm2K9JNEJHDQ_NANo7OZQ';

// Check if credentials are properly configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-supabase-project')
);

// Initialize Supabase Client SDK
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
