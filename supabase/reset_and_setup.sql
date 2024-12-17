-- Eliminar políticas existentes de manera segura
DO $$ 
BEGIN
    -- Intentar eliminar políticas si existen
    BEGIN
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON stores;
        DROP POLICY IF EXISTS "Enable read access for authenticated users" ON stores;
        DROP POLICY IF EXISTS "Enable update for store owners only" ON stores;
        DROP POLICY IF EXISTS "Enable delete for store owners only" ON stores;
        DROP POLICY IF EXISTS "Users can view their store's WhatsApp connection" ON whatsapp_connections;
        DROP POLICY IF EXISTS "Users can update their store's WhatsApp connection" ON whatsapp_connections;
        DROP POLICY IF EXISTS "Users can insert their store's WhatsApp connection" ON whatsapp_connections;
    EXCEPTION 
        WHEN undefined_table THEN 
            NULL;
    END;
END $$;

-- Eliminar tablas existentes de manera segura
DO $$ 
BEGIN
    -- Intentar eliminar tablas si existen
    DROP TABLE IF EXISTS whatsapp_messages CASCADE;
    DROP TABLE IF EXISTS whatsapp_connections CASCADE;
    DROP TABLE IF EXISTS product_presentations CASCADE;
    DROP TABLE IF EXISTS store_products CASCADE;
    DROP TABLE IF EXISTS store_categories CASCADE;
    DROP TABLE IF EXISTS store_schedule CASCADE;
    DROP TABLE IF EXISTS store_social_media CASCADE;
    DROP TABLE IF EXISTS store_appearance CASCADE;
    DROP TABLE IF EXISTS store_users CASCADE;
    DROP TABLE IF EXISTS stores CASCADE;
EXCEPTION 
    WHEN undefined_table THEN 
        NULL;
END $$;

-- Limpiar usuarios existentes
DELETE FROM auth.users;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para generar código de acceso único
CREATE OR REPLACE FUNCTION generate_unique_access_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
    success BOOLEAN := false;
BEGIN
    WHILE NOT success LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Verificar si el código ya existe
        IF NOT EXISTS (SELECT 1 FROM stores WHERE access_code = result) THEN
            success := true;
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Función para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar el estado del trial
CREATE OR REPLACE FUNCTION check_trial_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.trial_start_date + INTERVAL '15 days' < NOW() AND NEW.subscription_status = 'trial' THEN
        NEW.subscription_status := 'expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de usuarios personalizada
CREATE TABLE IF NOT EXISTS store_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    user_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de tiendas
CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    description TEXT,
    access_code TEXT UNIQUE DEFAULT generate_unique_access_code(),
    whatsapp TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Argentina',
    currency TEXT DEFAULT 'ARS',
    timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires'
);

-- Crear tabla de unidades de medida si no existe
CREATE TABLE IF NOT EXISTS measurement_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    system TEXT NOT NULL CHECK (system IN ('metric', 'imperial')),
    base_unit BOOLEAN DEFAULT false,
    conversion_factor DECIMAL(10,4),
    base_unit_id UUID REFERENCES measurement_units(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insertar unidades de medida básicas solo si no existen
DO $$
BEGIN
    -- Insertar gramo si no existe
    IF NOT EXISTS (SELECT 1 FROM measurement_units WHERE symbol = 'g') THEN
        INSERT INTO measurement_units (name, symbol, system, base_unit) VALUES ('Gramo', 'g', 'metric', true);
    END IF;
    
    -- Insertar kilogramo si no existe
    IF NOT EXISTS (SELECT 1 FROM measurement_units WHERE symbol = 'kg') THEN
        INSERT INTO measurement_units (name, symbol, system, base_unit) VALUES ('Kilogramo', 'kg', 'metric', false);
    END IF;
    
    -- Insertar libra si no existe
    IF NOT EXISTS (SELECT 1 FROM measurement_units WHERE symbol = 'lb') THEN
        INSERT INTO measurement_units (name, symbol, system, base_unit) VALUES ('Libra', 'lb', 'imperial', true);
    END IF;
    
    -- Insertar onza si no existe
    IF NOT EXISTS (SELECT 1 FROM measurement_units WHERE symbol = 'oz') THEN
        INSERT INTO measurement_units (name, symbol, system, base_unit) VALUES ('Onza', 'oz', 'imperial', false);
    END IF;
END $$;

-- Actualizar factores de conversión solo si es necesario
DO $$
BEGIN
    -- Actualizar factor de conversión para kilogramo si no está establecido
    UPDATE measurement_units 
    SET conversion_factor = 1000, 
        base_unit_id = (SELECT id FROM measurement_units WHERE symbol = 'g')
    WHERE symbol = 'kg' 
    AND (conversion_factor IS NULL OR base_unit_id IS NULL);

    -- Actualizar factor de conversión para onza si no está establecido
    UPDATE measurement_units 
    SET conversion_factor = 16, 
        base_unit_id = (SELECT id FROM measurement_units WHERE symbol = 'lb')
    WHERE symbol = 'oz'
    AND (conversion_factor IS NULL OR base_unit_id IS NULL);
END $$;

-- Crear tabla de categorías
CREATE TABLE store_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de productos
CREATE TABLE store_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de presentaciones de productos
CREATE TABLE product_presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES store_products(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES measurement_units(id),
    quantity DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de horarios
CREATE TABLE store_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
    schedule JSONB NOT NULL DEFAULT '{
        "monday": {
            "isOpen": true,
            "morning": { "open": "09:00", "close": "13:00" },
            "afternoon": { "open": "16:00", "close": "20:00" }
        },
        "tuesday": {
            "isOpen": true,
            "morning": { "open": "09:00", "close": "13:00" },
            "afternoon": { "open": "16:00", "close": "20:00" }
        },
        "wednesday": {
            "isOpen": true,
            "morning": { "open": "09:00", "close": "13:00" },
            "afternoon": { "open": "16:00", "close": "20:00" }
        },
        "thursday": {
            "isOpen": true,
            "morning": { "open": "09:00", "close": "13:00" },
            "afternoon": { "open": "16:00", "close": "20:00" }
        },
        "friday": {
            "isOpen": true,
            "morning": { "open": "09:00", "close": "13:00" },
            "afternoon": { "open": "16:00", "close": "20:00" }
        },
        "saturday": {
            "isOpen": true,
            "morning": { "open": "09:00", "close": "13:00" },
            "afternoon": { "open": "16:00", "close": "20:00" }
        },
        "sunday": {
            "isOpen": false,
            "morning": { "open": "09:00", "close": "13:00" },
            "afternoon": { "open": "16:00", "close": "20:00" }
        }
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de apariencia de la tienda
CREATE TABLE store_appearance (
    store_id TEXT PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
    logo_url TEXT,
    banner_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de redes sociales de la tienda
CREATE TABLE store_social_media (
    store_id TEXT PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
    instagram_url TEXT,
    facebook_url TEXT,
    whatsapp_number TEXT,
    whatsapp_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla para las conexiones de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
    phone_number TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at
    BEFORE UPDATE ON whatsapp_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear índices
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_store_users_user_id ON store_users(user_id);
CREATE INDEX idx_stores_owner_email ON stores(owner_email);
CREATE INDEX idx_store_categories_store_id ON store_categories(store_id);
CREATE INDEX idx_store_products_store_id ON store_products(store_id);
CREATE INDEX idx_store_products_category_id ON store_products(category_id);
CREATE INDEX idx_product_presentations_product_id ON product_presentations(product_id);
CREATE INDEX idx_product_presentations_unit_id ON product_presentations(unit_id);
CREATE INDEX idx_store_schedule_store_id ON store_schedule(store_id);

-- Crear triggers
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER check_trial_status
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION check_trial_status();

CREATE TRIGGER set_category_timestamp
    BEFORE UPDATE ON store_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_product_timestamp
    BEFORE UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_presentation_timestamp
    BEFORE UPDATE ON product_presentations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_schedule_timestamp
    BEFORE UPDATE ON store_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_appearance_timestamp
    BEFORE UPDATE ON store_appearance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_social_media_timestamp
    BEFORE UPDATE ON store_social_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_appearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_units ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla stores
CREATE POLICY "Enable insert for authenticated users only" 
    ON stores FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Enable read access for authenticated users" 
    ON stores FOR SELECT 
    USING (
        auth.uid() = owner_id OR 
        status = 'active'  -- Permite ver tiendas activas a todos los usuarios autenticados
    );

CREATE POLICY "Enable update for store owners only" 
    ON stores FOR UPDATE 
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Enable delete for store owners only" 
    ON stores FOR DELETE 
    USING (auth.uid() = owner_id);

-- Crear políticas
CREATE POLICY "Users can view their own store" ON stores
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own store" ON stores
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can view their own user data" ON store_users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert their own user data" ON store_users
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own user data" ON store_users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Categories are viewable by everyone" ON store_categories
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their store categories" ON store_categories
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can update their store categories" ON store_categories
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can delete their store categories" ON store_categories
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Products are viewable by everyone" ON store_products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their store products" ON store_products
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can update their store products" ON store_products
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can delete their store products" ON store_products
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Product presentations are viewable by everyone" ON product_presentations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their product presentations" ON product_presentations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM store_products sp 
            JOIN stores s ON sp.store_id = s.id 
            WHERE sp.id = product_id 
            AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their product presentations" ON product_presentations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 
            FROM store_products sp 
            JOIN stores s ON sp.store_id = s.id 
            WHERE sp.id = product_id 
            AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their product presentations" ON product_presentations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 
            FROM store_products sp 
            JOIN stores s ON sp.store_id = s.id 
            WHERE sp.id = product_id 
            AND s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Store schedule viewable by everyone" ON store_schedule
    FOR SELECT USING (true);

CREATE POLICY "Users can update their store schedule" ON store_schedule
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Store appearance viewable by everyone" ON store_appearance
    FOR SELECT USING (true);

CREATE POLICY "Users can update their store appearance" ON store_appearance
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Store social media viewable by everyone" ON store_social_media
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their store social media" ON store_social_media
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

CREATE POLICY "Users can update their store social media" ON store_social_media
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
    );

-- Políticas para measurement_units
CREATE POLICY "Allow read access to measurement_units for all authenticated users"
    ON measurement_units
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert to measurement_units for authenticated users only"
    ON measurement_units
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update to measurement_units for authenticated users only"
    ON measurement_units
    FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated');

-- Políticas de seguridad para whatsapp_connections
CREATE POLICY "Users can view their store's WhatsApp connection"
    ON whatsapp_connections FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM stores
        WHERE stores.id = whatsapp_connections.store_id
        AND stores.owner_id = auth.uid()
    ));

CREATE POLICY "Users can update their store's WhatsApp connection"
    ON whatsapp_connections FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM stores
        WHERE stores.id = whatsapp_connections.store_id
        AND stores.owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert their store's WhatsApp connection"
    ON whatsapp_connections FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM stores
        WHERE stores.id = whatsapp_connections.store_id
        AND stores.owner_id = auth.uid()
    ));

ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;
