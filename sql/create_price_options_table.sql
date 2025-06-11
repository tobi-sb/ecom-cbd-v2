-- SQL pour créer la table des options de prix
CREATE TABLE IF NOT EXISTS product_price_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_product_price_options_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_price_options_timestamp
BEFORE UPDATE ON product_price_options
FOR EACH ROW
EXECUTE FUNCTION update_product_price_options_timestamp();

-- Index pour accélérer les recherches par product_id
CREATE INDEX IF NOT EXISTS idx_product_price_options_product_id ON product_price_options(product_id); 