-- Eliminar políticas existentes si existen
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
    DROP POLICY IF EXISTS "Store owners can update their logos" ON storage.objects;
    DROP POLICY IF EXISTS "Store owners can delete their logos" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload banners" ON storage.objects;
    DROP POLICY IF EXISTS "Store owners can update their banners" ON storage.objects;
    DROP POLICY IF EXISTS "Store owners can delete their banners" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access for logos" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access for banners" ON storage.objects;
END $$;

-- Asegurarse de que los buckets existan
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('store-logos', 'store-logos', true),
    ('store-banners', 'store-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas para logos
CREATE POLICY "Public Access for logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'store-logos'
);

CREATE POLICY "Store owners can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'store-logos');

CREATE POLICY "Store owners can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'store-logos');

-- Políticas para banners
CREATE POLICY "Public Access for banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-banners');

CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'store-banners'
);

CREATE POLICY "Store owners can update banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'store-banners');

CREATE POLICY "Store owners can delete banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'store-banners');

-- Habilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
