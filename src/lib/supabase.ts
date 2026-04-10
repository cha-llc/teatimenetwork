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

// Log configuration status for debugging
const isConfigured = !!(supabaseUrl && supabaseKey);
console.log(`[Supabase] Configuration Status: ${isConfigured ? '✅ CONFIGURED' : '❌ MISSING'}`);

if (supabaseUrl) {
  console.log(`[Supabase] URL: ${supabaseUrl.substring(0, 30)}...`);
}

// Validate configuration with helpful error message
if (!supabaseUrl || !supabaseKey) {
  const errorMessage = `
╔════════════════════════════════════════════════════════════════════╗
║                    SUPABASE CONFIGURATION ERROR                   ║
╚════════════════════════════════════════════════════════════════════╝

❌ Missing environment variables:
${!supabaseUrl ? '  ✗ VITE_SUPABASE_URL\n' : '  ✓ VITE_SUPABASE_URL\n'}${!supabaseKey ? '  ✗ VITE_SUPABASE_ANON_KEY' : '  ✓ VITE_SUPABASE_ANON_KEY'}

📋 TO FIX:

For Development (.env.local):
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here

For Production (Vercel):
  1. Go to: https://vercel.com/dashboard/teatimenetwork
  2. Settings → Environment Variables
  3. Add: VITE_SUPABASE_URL (production value)
  4. Add: VITE_SUPABASE_ANON_KEY (production value)
  5. Redeploy

📍 Get credentials from: https://supabase.com/dashboard
   Project → Settings → API
`;
  
  console.error(errorMessage);
  
  // For development, create a dummy client that provides helpful errors
  // This prevents the entire app from crashing
  if (typeof window !== 'undefined') {
    // Client-side: show alert to user
    console.warn('⚠️  Supabase is not configured. Account creation and authentication will not work.');
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
  // Real authentication will fail with helpful error messages
  console.warn('⚠️  Creating dummy Supabase client - authentication will not work');
  
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

export { supabase };
