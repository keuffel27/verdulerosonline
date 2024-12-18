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

-- Política para permitir lectura pública de apariencia de tienda
CREATE POLICY "Permitir lectura pública de apariencia" ON store_appearance
  FOR SELECT
  USING (true);

-- Política para permitir lectura pública de redes sociales
CREATE POLICY "Permitir lectura pública de redes sociales" ON store_social_media
  FOR SELECT
  USING (true);

-- Política para permitir lectura pública de horarios
CREATE POLICY "Permitir lectura pública de horarios" ON store_schedule
  FOR SELECT
  USING (true);
