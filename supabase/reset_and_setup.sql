-- Primero limpiamos las tablas existentes en orden correcto (de hijas a padres)
DROP TABLE IF EXISTS store_products;
DROP TABLE IF EXISTS store_categories;
DROP TABLE IF EXISTS store_schedule;
DROP TABLE IF EXISTS store_social_media;
DROP TABLE IF EXISTS store_appearance;
DROP TABLE IF EXISTS store_users;
DROP TABLE IF EXISTS stores;
DELETE FROM auth.users;

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios personalizada
CREATE TABLE IF NOT EXISTS store_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    user_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de tiendas
CREATE TABLE stores (
    id TEXT PRIMARY KEY,
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

-- Crear índices
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_store_users_user_id ON store_users(user_id);
CREATE INDEX idx_stores_owner_email ON stores(owner_email);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON stores;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad para stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stores are viewable by everyone" ON stores;
CREATE POLICY "Stores are viewable by everyone" ON stores
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own store" ON stores;
CREATE POLICY "Users can insert their own store" ON stores
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own store" ON stores;
CREATE POLICY "Users can update their own store" ON stores
    FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own store" ON stores;
CREATE POLICY "Users can delete their own store" ON stores
    FOR DELETE USING (auth.uid() = owner_id);

-- Políticas de seguridad para store_users
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own user data" ON store_users;
CREATE POLICY "Users can view their own user data" ON store_users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own user data" ON store_users;
CREATE POLICY "Users can insert their own user data" ON store_users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own user data" ON store_users;
CREATE POLICY "Users can update their own user data" ON store_users
    FOR UPDATE USING (auth.uid() = id);

-- Función para verificar el estado del período de prueba
CREATE OR REPLACE FUNCTION check_trial_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Si han pasado más de 12 días desde trial_start_date y el estado es 'trial'
    IF NEW.subscription_status = 'trial' AND 
       NEW.trial_start_date + INTERVAL '12 days' < NOW() THEN
        NEW.subscription_status := 'expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el estado de la prueba
DROP TRIGGER IF EXISTS update_trial_status ON stores;
CREATE TRIGGER update_trial_status
    BEFORE INSERT OR UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION check_trial_status();

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
        
        IF NOT EXISTS (SELECT 1 FROM stores WHERE access_code = result) THEN
            success := true;
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de categorías
CREATE TABLE store_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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

-- Tabla para la configuración de apariencia de la tienda
CREATE TABLE store_appearance (
    store_id TEXT PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
    logo_url TEXT,
    banner_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla para las redes sociales de la tienda
CREATE TABLE store_social_media (
    store_id TEXT PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
    instagram_url TEXT,
    facebook_url TEXT,
    whatsapp_number TEXT,
    whatsapp_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla para productos
CREATE TABLE store_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para productos
CREATE INDEX idx_store_products_store_id ON store_products(store_id);
CREATE INDEX idx_store_products_category_id ON store_products(category_id);

-- Trigger para updated_at en productos
DROP TRIGGER IF EXISTS set_product_updated_at ON store_products;
CREATE TRIGGER set_product_updated_at
    BEFORE UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas para store_products
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

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

-- Trigger para mantener el order_index consecutivo en productos
CREATE OR REPLACE FUNCTION maintain_product_order()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Si no se especifica order_index, asignar el siguiente número disponible
        IF NEW.order_index = 0 THEN
            SELECT COALESCE(MAX(order_index), 0) + 1
            INTO NEW.order_index
            FROM store_products
            WHERE store_id = NEW.store_id
            AND category_id = NEW.category_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_product_order ON store_products;
CREATE TRIGGER set_product_order
    BEFORE INSERT ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION maintain_product_order();

-- Trigger para generar access_code si es null
CREATE OR REPLACE FUNCTION ensure_access_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.access_code IS NULL THEN
        NEW.access_code := generate_unique_access_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_access_code ON stores;
CREATE TRIGGER set_access_code
    BEFORE INSERT OR UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION ensure_access_code();

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_store_appearance
    BEFORE UPDATE ON store_appearance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_store_social_media
    BEFORE UPDATE ON store_social_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_store_schedule
    BEFORE UPDATE ON store_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_store_categories
    BEFORE UPDATE ON store_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_store_products
    BEFORE UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad para las nuevas tablas
ALTER TABLE store_appearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- Políticas para store_appearance
CREATE POLICY "Store appearance viewable by everyone" ON store_appearance FOR SELECT USING (true);
CREATE POLICY "Users can update their store appearance" ON store_appearance FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);

-- Políticas para store_social_media
CREATE POLICY "Store social media viewable by everyone" ON store_social_media FOR SELECT USING (true);
CREATE POLICY "Users can update their store social media" ON store_social_media FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);

-- Políticas para store_schedule
CREATE POLICY "Store schedule viewable by everyone" ON store_schedule FOR SELECT USING (true);
CREATE POLICY "Users can update their store schedule" ON store_schedule FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);

-- Políticas para store_categories
CREATE POLICY "Store categories viewable by everyone" ON store_categories FOR SELECT USING (true);
CREATE POLICY "Users can update their store categories" ON store_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_store_schedule_store_id ON store_schedule(store_id);
CREATE INDEX idx_store_categories_store_id ON store_categories(store_id);
CREATE INDEX idx_store_products_store_id ON store_products(store_id);
CREATE INDEX idx_store_products_category_id ON store_products(category_id);
