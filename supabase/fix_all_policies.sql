-- Eliminar todas las políticas existentes para productos y presentaciones
DROP POLICY IF EXISTS "Permitir lectura pública de productos" ON store_products;
DROP POLICY IF EXISTS "Permitir inserción de productos por dueños" ON store_products;
DROP POLICY IF EXISTS "Permitir actualización de productos por dueños" ON store_products;
DROP POLICY IF EXISTS "Permitir eliminación de productos por dueños" ON store_products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON store_products;
DROP POLICY IF EXISTS "Users can insert their store products" ON store_products;
DROP POLICY IF EXISTS "Users can update their store products" ON store_products;
DROP POLICY IF EXISTS "Users can delete their store products" ON store_products;

DROP POLICY IF EXISTS "Permitir lectura pública de presentaciones" ON product_presentations;
DROP POLICY IF EXISTS "Permitir inserción de presentaciones por dueños" ON product_presentations;
DROP POLICY IF EXISTS "Permitir actualización de presentaciones por dueños" ON product_presentations;
DROP POLICY IF EXISTS "Permitir eliminación de presentaciones por dueños" ON product_presentations;
DROP POLICY IF EXISTS "Product presentations are viewable by everyone" ON product_presentations;
DROP POLICY IF EXISTS "Users can insert their product presentations" ON product_presentations;
DROP POLICY IF EXISTS "Users can update their product presentations" ON product_presentations;
DROP POLICY IF EXISTS "Users can delete their product presentations" ON product_presentations;

-- Recrear las políticas para productos
CREATE POLICY "Permitir lectura pública de productos" ON store_products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Permitir inserción de productos por dueños" ON store_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE id = store_id 
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Permitir actualización de productos por dueños" ON store_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE id = store_id 
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Permitir eliminación de productos por dueños" ON store_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE id = store_id 
            AND owner_id = auth.uid()
        )
    );

-- Recrear las políticas para presentaciones
CREATE POLICY "Permitir lectura pública de presentaciones" ON product_presentations
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de presentaciones por dueños" ON product_presentations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM store_products sp
            JOIN stores s ON sp.store_id = s.id
            WHERE sp.id = product_id 
            AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Permitir actualización de presentaciones por dueños" ON product_presentations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 
            FROM store_products sp
            JOIN stores s ON sp.store_id = s.id
            WHERE sp.id = product_id 
            AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Permitir eliminación de presentaciones por dueños" ON product_presentations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 
            FROM store_products sp
            JOIN stores s ON sp.store_id = s.id
            WHERE sp.id = product_id 
            AND s.owner_id = auth.uid()
        )
    );
