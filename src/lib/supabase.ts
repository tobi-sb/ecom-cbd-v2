import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlghexxbhunsxmhbypkr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZ2hleHhiaHVuc3htaGJ5cGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjEzOTEsImV4cCI6MjA2MjM5NzM5MX0.mHoCPJYU0VMnrqqag2JZFwzX0x6bv_tfvdQqrRhYC6Y';

// Create Supabase client with persistent sessions enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Store auth session in browser's local storage
    storageKey: 'supabase-auth', // Use a consistent key for storage
    autoRefreshToken: true, // Auto refresh token
    detectSessionInUrl: true, // Detect session in URL on page load
  }
});