-- Eliminar políticas existentes
DO $$ 
BEGIN
    -- Stores
    DROP POLICY IF EXISTS "Permitir lectura pública de tiendas" ON stores;
    DROP POLICY IF EXISTS "Permitir lectura pública de categorías" ON store_categories;
    DROP POLICY IF EXISTS "Permitir lectura pública de productos" ON store_products;
    DROP POLICY IF EXISTS "Permitir lectura pública de presentaciones" ON product_presentations;
    DROP POLICY IF EXISTS "Permitir lectura pública de unidades" ON measurement_units;
    DROP POLICY IF EXISTS "Permitir lectura pública de apariencia" ON store_appearance;
    DROP POLICY IF EXISTS "Permitir lectura pública de redes sociales" ON store_social_media;
    DROP POLICY IF EXISTS "Permitir lectura pública de horarios" ON store_schedule;
    
    -- Store Appearance
    DROP POLICY IF EXISTS "Permitir inserción de apariencia por dueños" ON store_appearance;
    DROP POLICY IF EXISTS "Permitir actualización de apariencia por dueños" ON store_appearance;
    DROP POLICY IF EXISTS "Permitir eliminación de apariencia por dueños" ON store_appearance;
END $$;

-- Habilitar RLS en todas las tablas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_appearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_schedule ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública de tiendas activas
CREATE POLICY "Permitir lectura pública de tiendas" ON stores
  FOR SELECT
  USING (status = 'active');

-- Política para permitir a los dueños crear tiendas
CREATE POLICY "Permitir creación de tiendas" ON stores
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Política para permitir a los dueños actualizar sus tiendas
CREATE POLICY "Permitir actualización de tiendas por dueños" ON stores
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Política para permitir a los dueños eliminar sus tiendas
CREATE POLICY "Permitir eliminación de tiendas por dueños" ON stores
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Política para permitir lectura pública de categorías
CREATE POLICY "Permitir lectura pública de categorías" ON store_categories
  FOR SELECT
  USING (true);

-- Política para permitir lectura pública de productos activos
CREATE POLICY "Permitir lectura pública de productos" ON store_products
  FOR SELECT
  USING (status = 'active');

-- Política para permitir lectura pública de presentaciones
CREATE POLICY "Permitir lectura pública de presentaciones" ON product_presentations
  FOR SELECT
  USING (true);

-- Política para permitir lectura pública de unidades de medida
CREATE POLICY "Permitir lectura pública de unidades" ON measurement_units
  FOR SELECT
  USING (true);

-- Políticas para store_appearance
CREATE POLICY "Permitir lectura pública de apariencia" ON store_appearance
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de apariencia por dueños" ON store_appearance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE id = store_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Permitir actualización de apariencia por dueños" ON store_appearance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE id = store_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Permitir eliminación de apariencia por dueños" ON store_appearance
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE id = store_id
      AND owner_id = auth.uid()
    )
  );

-- Política para permitir lectura pública de redes sociales
CREATE POLICY "Permitir lectura pública de redes sociales" ON store_social_media
  FOR SELECT
  USING (true);

-- Política para permitir lectura pública de horarios
CREATE POLICY "Permitir lectura pública de horarios" ON store_schedule
  FOR SELECT
  USING (true);
