-- Create color variants table
CREATE TABLE IF NOT EXISTS color_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(50) NOT NULL,
  image_url TEXT,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add index for faster queries
CREATE INDEX idx_color_variants_product_id ON color_variants(product_id);

-- Enable Row Level Security
ALTER TABLE color_variants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Color variants are viewable by everyone"
ON color_variants FOR SELECT USING (true);

CREATE POLICY "Color variants can be created by authenticated users"
ON color_variants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Color variants can be updated by authenticated users"
ON color_variants FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Color variants can be deleted by authenticated users"
ON color_variants FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_color_variants_updated_at
    BEFORE UPDATE ON color_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 