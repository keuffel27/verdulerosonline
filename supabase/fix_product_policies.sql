-- Eliminar la política existente
DROP POLICY IF EXISTS "Permitir lectura pública de productos" ON store_products;

-- Recrear las políticas correctas
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
