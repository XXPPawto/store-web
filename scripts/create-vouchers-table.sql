-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample vouchers
INSERT INTO vouchers (code, name, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_until) VALUES
('WELCOME10', 'Welcome Discount', 'Get 10% off for new customers', 'percentage', 10.00, 50000, 25000, 100, NOW() + INTERVAL '30 days'),
('SAVE20K', 'Save 20K', 'Fixed discount 20,000 rupiah', 'fixed', 20000.00, 100000, NULL, 50, NOW() + INTERVAL '7 days'),
('MEGA50', 'Mega Sale 50%', 'Huge 50% discount for limited time', 'percentage', 50.00, 200000, 100000, 20, NOW() + INTERVAL '3 days'),
('STUDENT15', 'Student Discount', '15% off for students', 'percentage', 15.00, 30000, 50000, 200, NOW() + INTERVAL '60 days');

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on active vouchers" ON vouchers FOR SELECT USING (is_active = true);
CREATE POLICY "Allow all operations on vouchers" ON vouchers FOR ALL USING (true);
