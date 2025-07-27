-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create policy to allow public uploads
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Create policy to allow public access
CREATE POLICY "Allow public access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- Create policy to allow public updates
CREATE POLICY "Allow public updates" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images');

-- Create policy to allow public deletes
CREATE POLICY "Allow public deletes" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images');
