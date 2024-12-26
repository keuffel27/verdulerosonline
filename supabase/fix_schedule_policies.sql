-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura pública de horarios" ON store_schedule;
DROP POLICY IF EXISTS "Permitir inserción de horarios por dueños" ON store_schedule;
DROP POLICY IF EXISTS "Permitir actualización de horarios por dueños" ON store_schedule;
DROP POLICY IF EXISTS "Permitir eliminación de horarios por dueños" ON store_schedule;

-- Asegurarse de que RLS está habilitado
ALTER TABLE store_schedule ENABLE ROW LEVEL SECURITY;

-- Crear nuevas políticas
CREATE POLICY "Permitir lectura pública de horarios" ON store_schedule
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción de horarios por dueños" ON store_schedule
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE id = store_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Permitir actualización de horarios por dueños" ON store_schedule
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE id = store_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Permitir eliminación de horarios por dueños" ON store_schedule
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE id = store_id
      AND owner_id = auth.uid()
    )
  );
