-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    owner_name TEXT NOT NULL,
    access_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    whatsapp TEXT,
    instagram TEXT,
    facebook TEXT,
    schedule JSONB,
    theme JSONB
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL
);

-- Create store analytics view
CREATE VIEW store_analytics AS
WITH order_stats AS (
    SELECT 
        store_id,
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as orders_last_30_days,
        SUM(total) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as revenue_last_30_days
    FROM orders
    WHERE status != 'cancelled'
    GROUP BY store_id
)
SELECT 
    store_id,
    COALESCE(total_orders, 0) as total_orders,
    COALESCE(total_revenue, 0) as total_revenue,
    CASE 
        WHEN total_orders > 0 THEN total_revenue / total_orders 
        ELSE 0 
    END as average_order_value,
    COALESCE(orders_last_30_days, 0) as orders_last_30_days,
    COALESCE(revenue_last_30_days, 0) as revenue_last_30_days
FROM order_stats;