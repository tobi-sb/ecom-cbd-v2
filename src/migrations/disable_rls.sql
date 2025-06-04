-- IMPORTANT: This disables Row Level Security entirely and should only be used in development
-- For production, use proper RLS policies instead (see fix_rls_policies.sql)

-- Disable RLS on the products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Disable RLS on the categories table
ALTER TABLE categories DISABLE ROW LEVEL SECURITY; 