-- Ajouter la colonne is_special_resin à la table products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_special_resin BOOLEAN DEFAULT false;

-- Ajouter les colonnes pour les prix spéciaux résines si elles n'existent pas
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_special_10 NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_special_20 NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_special_30 NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_special_50 NUMERIC(10, 2) DEFAULT 0; 