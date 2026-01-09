import { createClient } from '@supabase/supabase-js';

// Initialize database client
const supabaseUrl = 'https://balzcyctvzmyawlacsfr.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImMxNDUyZGY1LTE2YjMtNDk5NC04YWI4LWYxYTk3ZjBhN2Q5MSJ9.eyJwcm9qZWN0SWQiOiJiYWx6Y3ljdHZ6bXlhd2xhY3NmciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY2NTQwMjA1LCJleHAiOjIwODE5MDAyMDUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.muzktehlwWu83tEBe5NbrfVFJ7FaOCsM9Y_kX26cHQ0';

// Create client with additional options for better reliability
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'teatimenetwork-web',
    },
  },
});

export { supabase };
