-- Create products table with the required fields
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price_3g DECIMAL(10, 2) NOT NULL,
  price_5g DECIMAL(10, 2) NOT NULL,
  price_10g DECIMAL(10, 2) NOT NULL,
  price_20g DECIMAL(10, 2) NOT NULL,
  cbd_percentage DECIMAL(5, 2) NOT NULL,
  culture_type VARCHAR(50) NOT NULL CHECK (culture_type IN ('indoor', 'outdoor')),
  origin VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  image_url TEXT,
  category VARCHAR(50),
  tag VARCHAR(50)
);

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for reading products (everyone can read products)
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT USING (true);

-- Policy for creating products (only authenticated users)
CREATE POLICY "Products can be created by authenticated users" 
ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating products (only authenticated users)
CREATE POLICY "Products can be updated by authenticated users" 
ON products FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for deleting products (only authenticated users)
CREATE POLICY "Products can be deleted by authenticated users" 
ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample products data
INSERT INTO products (name, description, price_3g, price_5g, price_10g, price_20g, cbd_percentage, culture_type, origin, image_url, category, tag)
VALUES
  ('Gorilla Glue CBD', 'Une variété très appréciée pour ses arômes intenses et son effet relaxant puissant.', 24.99, 39.99, 74.99, 139.99, 18.5, 'indoor', 'Suisse', '/images/gorilla-glue-small-buds-ivory.webp', 'fleurs', 'Bestseller'),
  ('Harlequin Indoor', 'Variété équilibrée avec des notes tropicales et un effet doux.', 19.99, 29.99, 54.99, 99.99, 15.0, 'indoor', 'Italie', '/images/fleurs-cbd-indoor-harlequin-ivory.webp', 'fleurs', 'Nouveau'),
  ('OG Kush CBD', 'Fleurs premium avec un profil terreux et épicé caractéristique.', 22.99, 34.99, 64.99, 119.99, 20.0, 'indoor', 'Espagne', '/images/gorilla-glue-small-buds-ivory.webp', 'fleurs', 'Populaire'),
  ('Huile CBD Premium 15%', 'Huile full spectrum de haute qualité extraite des meilleures fleurs.', 49.99, 0, 0, 0, 15.0, 'indoor', 'France', '/images/huile/huile-de-cbd-5-avec-thc-full-spectrum-chanvroo-france.webp', 'huiles', 'Premium'),
  ('Hash CBD King Hassan', 'Résine de haute qualité, fabriquée selon les méthodes traditionnelles marocaines.', 24.99, 39.99, 74.99, 0, 22.0, 'outdoor', 'Maroc', '/images/resines/hash-cbd-king-hassan-easyweed.webp', 'resines', 'Bestseller'); 