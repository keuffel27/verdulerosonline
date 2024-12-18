-- Asegurar que las tablas existen y tienen las relaciones correctas
DO $$ 
BEGIN
    -- Verificar y crear la tabla store_categories si no existe
    CREATE TABLE IF NOT EXISTS store_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Verificar y crear la tabla store_products si no existe
    CREATE TABLE IF NOT EXISTS store_products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        category_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Verificar y crear la tabla product_presentations si no existe
    CREATE TABLE IF NOT EXISTS product_presentations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
        unit_id UUID NOT NULL REFERENCES measurement_units(id),
        quantity NUMERIC NOT NULL,
        price NUMERIC NOT NULL,
        sale_price NUMERIC,
        stock INTEGER NOT NULL DEFAULT 0,
        is_default BOOLEAN NOT NULL DEFAULT false,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Crear índices para mejorar el rendimiento
    CREATE INDEX IF NOT EXISTS idx_store_categories_store_id ON store_categories(store_id);
    CREATE INDEX IF NOT EXISTS idx_store_products_store_id ON store_products(store_id);
    CREATE INDEX IF NOT EXISTS idx_store_products_category_id ON store_products(category_id);
    CREATE INDEX IF NOT EXISTS idx_product_presentations_product_id ON product_presentations(product_id);
END $$;
