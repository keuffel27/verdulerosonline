-- Eliminar la política existente
DROP POLICY IF EXISTS "Permitir lectura pública de presentaciones" ON product_presentations;

-- Recrear las políticas correctas
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
