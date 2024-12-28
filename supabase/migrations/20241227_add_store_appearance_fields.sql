-- Añadir nuevos campos a la tabla store_appearance
ALTER TABLE store_appearance
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS products_background_url TEXT;

-- Actualizar las políticas existentes para incluir los nuevos campos
DO $$ 
BEGIN
    -- Actualizar política de actualización
    DROP POLICY IF EXISTS "Users can update their store appearance" ON store_appearance;
    CREATE POLICY "Users can update their store appearance" ON store_appearance
        FOR UPDATE USING (
            EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
        );

    -- Actualizar política de lectura si existe
    DROP POLICY IF EXISTS "Anyone can view store appearance" ON store_appearance;
    CREATE POLICY "Anyone can view store appearance" ON store_appearance
        FOR SELECT USING (true);
END $$;
