-- Crear tabla para las conexiones de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_connected BOOLEAN DEFAULT false,
    welcome_message TEXT,
    auto_reply BOOLEAN DEFAULT true,
    business_hours BOOLEAN DEFAULT true,
    session_data JSONB,
    UNIQUE(store_id)
);

-- Crear tabla para los mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('incoming', 'outgoing', 'auto')),
    phone_number TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    metadata JSONB
);

-- Crear índices
CREATE INDEX idx_whatsapp_connections_store_id ON whatsapp_connections(store_id);
CREATE INDEX idx_whatsapp_messages_store_id ON whatsapp_messages(store_id);
CREATE INDEX idx_whatsapp_messages_phone_number ON whatsapp_messages(phone_number);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

-- Trigger para updated_at en whatsapp_connections
CREATE TRIGGER set_whatsapp_connections_updated_at
    BEFORE UPDATE ON whatsapp_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para whatsapp_connections
CREATE POLICY "Users can view their store's WhatsApp connection" 
    ON whatsapp_connections FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can update their store's WhatsApp connection" 
    ON whatsapp_connections FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert their store's WhatsApp connection" 
    ON whatsapp_connections FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

-- Políticas para whatsapp_messages
CREATE POLICY "Users can view their store's WhatsApp messages" 
    ON whatsapp_messages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert WhatsApp messages for their store" 
    ON whatsapp_messages FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM stores 
        WHERE id = store_id 
        AND owner_id = auth.uid()
    ));
