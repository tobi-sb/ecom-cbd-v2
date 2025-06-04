-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add category_id column to products table and create foreign key
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Insert categories data
INSERT INTO categories (name, slug, description, image_url)
VALUES
  ('Fleurs CBD', 'fleurs', 'Découvrez notre sélection de fleurs CBD de haute qualité, cultivées avec soin pour un effet optimal.', '/images/categories/fleurs-cbd.webp'),
  ('Huiles CBD', 'huiles', 'Nos huiles CBD sont fabriquées à partir d''extraits naturels et sont disponibles en différentes concentrations.', '/images/categories/huiles-cbd.webp'),
  ('Résines CBD', 'resines', 'Résines CBD traditionnelles et authentiques, élaborées selon des méthodes ancestrales.', '/images/categories/resines-cbd.webp'),
  ('Comestibles', 'comestibles', 'Une variété de produits comestibles infusés au CBD pour une expérience gustative.', '/images/categories/comestibles-cbd.webp'),
  ('Nouveautés', 'nouveautes', 'Découvrez nos derniers produits CBD, fraîchement arrivés dans notre boutique.', '/images/categories/nouveautes-cbd.webp');

-- Update products with corresponding category_id based on the existing category field
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = products.category) WHERE category IS NOT NULL; 