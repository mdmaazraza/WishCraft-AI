-- ====================================================================
-- WishCraft AI (Wish Yours) — Supabase Cloud Storage Setup
-- Run this in the Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Create the 'wish-photos' public storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'wish-photos', 
    'wish-photos', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Storage Policy: Allow public read access to anyone
DROP POLICY IF EXISTS "Public wish photos access" ON storage.objects;
CREATE POLICY "Public wish photos access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'wish-photos');

-- 3. Storage Policy: Allow public upload access
DROP POLICY IF EXISTS "Public wish photos upload" ON storage.objects;
CREATE POLICY "Public wish photos upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'wish-photos');

-- 4. Storage Policy: Allow updating wish photos
DROP POLICY IF EXISTS "Public wish photos update" ON storage.objects;
CREATE POLICY "Public wish photos update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'wish-photos');

-- 5. Storage Policy: Allow deleting wish photos
DROP POLICY IF EXISTS "Public wish photos delete" ON storage.objects;
CREATE POLICY "Public wish photos delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'wish-photos');
