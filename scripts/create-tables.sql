-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table with proper foreign key
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  item_bought VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
  ('Legendary Pets'),
  ('Epic Pets'),
  ('Rare Pets'),
  ('Common Pets');

-- Insert sample products with proper category references
WITH category_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO products (name, price, image_url, category_id, stock, description) 
VALUES 
  (
    'Golden Dragon',
    150000,
    '/placeholder.svg?height=300&width=300',
    (SELECT id FROM category_ids WHERE name = 'Legendary Pets'),
    5,
    'A majestic golden dragon with incredible powers. Perfect for advanced players.'
  ),
  (
    'Rainbow Unicorn',
    120000,
    '/placeholder.svg?height=300&width=300',
    (SELECT id FROM category_ids WHERE name = 'Legendary Pets'),
    8,
    'A beautiful rainbow unicorn that brings luck and magic to your garden.'
  ),
  (
    'Fire Phoenix',
    80000,
    '/placeholder.svg?height=300&width=300',
    (SELECT id FROM category_ids WHERE name = 'Epic Pets'),
    12,
    'A powerful fire phoenix that can help you grow rare plants faster.'
  ),
  (
    'Crystal Wolf',
    65000,
    '/placeholder.svg?height=300&width=300',
    (SELECT id FROM category_ids WHERE name = 'Epic Pets'),
    15,
    'A mystical crystal wolf with enhanced gathering abilities.'
  ),
  (
    'Magic Cat',
    35000,
    '/placeholder.svg?height=300&width=300',
    (SELECT id FROM category_ids WHERE name = 'Rare Pets'),
    20,
    'A cute magic cat that helps with daily garden tasks.'
  ),
  (
    'Garden Bunny',
    15000,
    '/placeholder.svg?height=300&width=300',
    (SELECT id FROM category_ids WHERE name = 'Common Pets'),
    30,
    'A friendly garden bunny perfect for beginners.'
  );

-- Enable Row Level Security (optional but recommended)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on approved testimonials" ON testimonials FOR SELECT USING (approved = true);

-- Allow public insert on testimonials (for user submissions)
CREATE POLICY "Allow public insert on testimonials" ON testimonials FOR INSERT WITH CHECK (true);
