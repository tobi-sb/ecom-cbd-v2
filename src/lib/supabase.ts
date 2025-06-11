import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client with persistent sessions enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Store auth session in browser's local storage
    storageKey: 'supabase-auth', // Use a consistent key for storage
    autoRefreshToken: true, // Auto refresh token
    detectSessionInUrl: true, // Detect session in URL on page load
  }
});