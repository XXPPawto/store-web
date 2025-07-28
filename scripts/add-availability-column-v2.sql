-- Add is_available column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Update existing products to be available by default
UPDATE products SET is_available = true WHERE is_available IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'is_available';
