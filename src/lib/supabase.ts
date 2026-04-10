import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT INITIALIZATION
 * 
 * CRITICAL: These values MUST come from environment variables
 * Add to .env.local (development) or Vercel environment variables (production):
 * 
 * VITE_SUPABASE_URL=https://[project].supabase.co
 * VITE_SUPABASE_ANON_KEY=[your-anon-key]
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ CRITICAL: Supabase configuration missing!\n' +
    'Add these environment variables:\n' +
    '  VITE_SUPABASE_URL=https://[project].supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=[your-anon-key]\n\n' +
    'For development: Create .env.local in project root\n' +
    'For production: Add to Vercel environment variables'
  );
  throw new Error('Supabase credentials not configured');
}

// Create client with additional options for better reliability
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce', // PKCE flow for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'teatimenetwork-web',
    },
  },
});

export { supabase };
