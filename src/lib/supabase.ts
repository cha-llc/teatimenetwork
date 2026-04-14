import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT - React Native
 *
 * Environment variables sourced from app.json extra or .env via expo-constants.
 * For local dev, create a .env file with:
 *   EXPO_PUBLIC_SUPABASE_URL=https://[project].supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
 */

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isConfigured = !!(supabaseUrl && supabaseKey);

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase not configured.\n' +
    'Create a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Not applicable for React Native
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'teatimenetwork-mobile',
      },
    },
  }
);
