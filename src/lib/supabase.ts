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

// Get credentials from environment - try multiple sources
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
let supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Configuration validation
const isConfigured = !!(supabaseUrl && supabaseKey);

// Validate configuration with helpful error message
if (!supabaseUrl || !supabaseKey) {
  if (typeof window !== 'undefined') {
    console.error(
      '❌ SUPABASE CONFIGURATION ERROR\n' +
      'Missing environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY\n' +
      'For Vercel: https://vercel.com/dashboard/teatimenetwork → Settings → Environment Variables'
    );
  }
}

// Create client with proper error handling
let supabase;

if (supabaseUrl && supabaseKey) {
  // Credentials are available - create real client
  supabase = createClient(supabaseUrl, supabaseKey, {
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
} else {
  // Credentials missing - create dummy client to prevent crashes
  supabase = createClient(
    supabaseUrl || 'https://dummy.supabase.co',
    supabaseKey || 'dummy-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'teatimenetwork-web-unconfigured',
        },
      },
    }
  );
}

export { supabase, isConfigured };
