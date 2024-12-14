-- Agregar columna para las presentaciones de productos
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS package_sizes TEXT[] DEFAULT '{}';

-- Actualizar las políticas existentes para incluir el nuevo campo
DROP POLICY IF EXISTS "Users can update their store products" ON store_products;
CREATE POLICY "Users can update their store products" ON store_products FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);
