-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be created by authenticated users" ON products;
DROP POLICY IF EXISTS "Products can be updated by authenticated users" ON products;
DROP POLICY IF EXISTS "Products can be deleted by authenticated users" ON products;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories can be created by authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories can be updated by authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories can be deleted by authenticated users" ON categories;

-- Products table policies
-- Allow anyone to view products
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT USING (true);

-- Allow authenticated users to create products
CREATE POLICY "Products can be created by authenticated users" 
ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update products
CREATE POLICY "Products can be updated by authenticated users" 
ON products FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete products
CREATE POLICY "Products can be deleted by authenticated users" 
ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Categories table policies
-- Allow anyone to view categories
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT USING (true);

-- Allow authenticated users to create categories
CREATE POLICY "Categories can be created by authenticated users" 
ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update categories
CREATE POLICY "Categories can be updated by authenticated users" 
ON categories FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete categories
CREATE POLICY "Categories can be deleted by authenticated users" 
ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Storage policies for product images
-- Allow anyone to view images
CREATE POLICY "Product images are viewable by everyone"
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE USING (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
); 