-- Add review_count and rating columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0.0;

-- Update existing products with sample values (optional)
UPDATE products 
SET 
  review_count = FLOOR(RANDOM() * 100)::INTEGER, 
  rating = (RANDOM() * 3 + 2)::DECIMAL(3,2)
WHERE id IS NOT NULL;

-- Create an index for faster sorting by rating
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC); 