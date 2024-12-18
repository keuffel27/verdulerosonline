-- Eliminar políticas relacionadas con productos
DO $$ 
BEGIN
    -- Intentar eliminar políticas si existen
    BEGIN
        DROP POLICY IF EXISTS "Enable read access for products" ON store_products;
        DROP POLICY IF EXISTS "Enable update for store owners only" ON store_products;
        DROP POLICY IF EXISTS "Enable delete for store owners only" ON store_products;
        DROP POLICY IF EXISTS "Enable insert for store owners only" ON store_products;
        DROP POLICY IF EXISTS "Enable read access for presentations" ON product_presentations;
        DROP POLICY IF EXISTS "Enable update for store owners only" ON product_presentations;
        DROP POLICY IF EXISTS "Enable delete for store owners only" ON product_presentations;
        DROP POLICY IF EXISTS "Enable insert for store owners only" ON product_presentations;
    EXCEPTION 
        WHEN undefined_object THEN 
            NULL;
    END;
END $$;

-- Eliminar tablas relacionadas con productos
DO $$ 
BEGIN
    -- Primero eliminamos product_presentations ya que depende de store_products
    DROP TABLE IF EXISTS product_presentations CASCADE;
    
    -- Luego eliminamos store_products
    DROP TABLE IF EXISTS store_products CASCADE;
EXCEPTION 
    WHEN undefined_table THEN 
        NULL;
END $$;
