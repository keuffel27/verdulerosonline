-- Crear tabla para las presentaciones de productos
CREATE TABLE store_product_presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES store_products(id) ON DELETE CASCADE,
    weight_in_grams NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Modificar la tabla de productos
ALTER TABLE store_products 
    ADD COLUMN base_unit_type TEXT NOT NULL DEFAULT 'kg' CHECK (base_unit_type IN ('kg', 'lb')),
    ADD COLUMN base_price_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

-- Índices
CREATE INDEX idx_product_presentations_product_id ON store_product_presentations(product_id);

-- Función para calcular el precio de una presentación
CREATE OR REPLACE FUNCTION calculate_presentation_price(
    base_price NUMERIC,
    base_unit_type TEXT,
    weight_in_grams NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    IF base_unit_type = 'kg' THEN
        -- Convertir a kg y multiplicar por el precio base
        RETURN (weight_in_grams / 1000.0) * base_price;
    ELSE
        -- Convertir a libras (1 lb = 453.592 gramos) y multiplicar por el precio base
        RETURN (weight_in_grams / 453.592) * base_price;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para generar presentaciones estándar
CREATE OR REPLACE FUNCTION generate_standard_presentations(
    product_id UUID,
    base_unit_type TEXT
) RETURNS VOID AS $$
DECLARE
    weight NUMERIC;
BEGIN
    -- Eliminar presentaciones existentes
    DELETE FROM store_product_presentations WHERE product_id = $1;
    
    IF base_unit_type = 'kg' THEN
        -- Generar presentaciones métricas (100g a 2kg)
        -- 100g, 250g, 500g, 750g, 1kg, 1.5kg, 2kg
        INSERT INTO store_product_presentations (product_id, weight_in_grams)
        VALUES
            ($1, 100),
            ($1, 250),
            ($1, 500),
            ($1, 750),
            ($1, 1000),
            ($1, 1500),
            ($1, 2000);
    ELSE
        -- Generar presentaciones imperiales (1/4 lb a 4 lb)
        -- 0.25lb, 0.5lb, 1lb, 1.5lb, 2lb, 3lb, 4lb
        INSERT INTO store_product_presentations (product_id, weight_in_grams)
        VALUES
            ($1, 113.398), -- 0.25 lb
            ($1, 226.796), -- 0.5 lb
            ($1, 453.592), -- 1 lb
            ($1, 680.388), -- 1.5 lb
            ($1, 907.184), -- 2 lb
            ($1, 1360.78), -- 3 lb
            ($1, 1814.37); -- 4 lb
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Disparador para generar presentaciones al insertar o actualizar un producto
CREATE OR REPLACE FUNCTION trigger_generate_presentations()
RETURNS TRIGGER AS $$
BEGIN
    -- Generar presentaciones si el tipo de unidad base cambió o es un nuevo producto
    IF TG_OP = 'INSERT' OR NEW.base_unit_type <> OLD.base_unit_type THEN
        PERFORM generate_standard_presentations(NEW.id, NEW.base_unit_type);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_presentations_trigger
AFTER INSERT OR UPDATE ON store_products
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_presentations();

-- Vista para productos con presentaciones y precios calculados
CREATE OR REPLACE VIEW product_presentations_view AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.description,
    p.image_url,
    p.base_unit_type,
    p.base_price_per_unit,
    pp.id as presentation_id,
    pp.weight_in_grams,
    calculate_presentation_price(p.base_price_per_unit, p.base_unit_type, pp.weight_in_grams) as price
FROM 
    store_products p
    JOIN store_product_presentations pp ON p.id = pp.product_id
WHERE 
    pp.is_active = true;

-- Trigger para updated_at en presentaciones
CREATE TRIGGER set_timestamp_product_presentations
    BEFORE UPDATE ON store_product_presentations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
