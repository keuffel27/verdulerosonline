-- Tabla para caché de respuestas frecuentes
CREATE TABLE IF NOT EXISTS whatsapp_response_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    query_hash TEXT NOT NULL,
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(store_id, query_hash)
);

-- Tabla para plantillas de mensajes
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(store_id, name)
);

-- Tabla para configuración de notificaciones
CREATE TABLE IF NOT EXISTS whatsapp_notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    channels JSONB DEFAULT '["whatsapp", "email"]'::jsonb,
    schedule JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(store_id, notification_type)
);

-- Tabla para entrenamiento personalizado del chatbot
CREATE TABLE IF NOT EXISTS whatsapp_bot_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    intent TEXT NOT NULL,
    examples TEXT[] NOT NULL,
    responses TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Índices
CREATE INDEX idx_response_cache_query_hash ON whatsapp_response_cache(store_id, query_hash);
CREATE INDEX idx_message_templates_store ON whatsapp_message_templates(store_id);
CREATE INDEX idx_notification_settings_store ON whatsapp_notification_settings(store_id);
CREATE INDEX idx_bot_training_store_intent ON whatsapp_bot_training(store_id, intent);

-- Políticas RLS
ALTER TABLE whatsapp_response_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_bot_training ENABLE ROW LEVEL SECURITY;

-- Políticas para whatsapp_response_cache
CREATE POLICY "Users can view their store's response cache" 
    ON whatsapp_response_cache FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can manage their store's response cache" 
    ON whatsapp_response_cache FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

-- Políticas para whatsapp_message_templates
CREATE POLICY "Users can view their store's message templates" 
    ON whatsapp_message_templates FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can manage their store's message templates" 
    ON whatsapp_message_templates FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

-- Políticas para whatsapp_notification_settings
CREATE POLICY "Users can view their store's notification settings" 
    ON whatsapp_notification_settings FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can manage their store's notification settings" 
    ON whatsapp_notification_settings FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

-- Políticas para whatsapp_bot_training
CREATE POLICY "Users can view their store's bot training data" 
    ON whatsapp_bot_training FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can manage their store's bot training data" 
    ON whatsapp_bot_training FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));
