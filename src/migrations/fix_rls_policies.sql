-- Enable RLS on the products table if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous select" ON products;
DROP POLICY IF EXISTS "Allow anonymous insert" ON products;
DROP POLICY IF EXISTS "Allow anonymous update" ON products;
DROP POLICY IF EXISTS "Allow anonymous delete" ON products;

-- Create policies for anonymous access (for testing/development)
CREATE POLICY "Allow anonymous select" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete" ON products
  FOR DELETE USING (true);

-- Same for categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous select" ON categories;
DROP POLICY IF EXISTS "Allow anonymous insert" ON categories;
DROP POLICY IF EXISTS "Allow anonymous update" ON categories;
DROP POLICY IF EXISTS "Allow anonymous delete" ON categories;

CREATE POLICY "Allow anonymous select" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON categories
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete" ON categories
  FOR DELETE USING (true); 