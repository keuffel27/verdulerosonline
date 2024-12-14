import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Database Types
export type DBStore = Tables<'stores'>;
export type DBProduct = Tables<'products'>;
export type DBCategory = Tables<'categories'>;
export type DBWhatsAppConnection = Tables<'whatsapp_connections'>;
export type DBWhatsAppMessage = Tables<'whatsapp_messages'>;
export type DBWhatsAppBotTraining = Tables<'whatsapp_bot_training'>;
export type DBWhatsAppCache = Tables<'whatsapp_cache'>;
export type DBStoreSchedule = Tables<'store_schedule'>;

// Frontend Types
export interface Product extends DBProduct {
  store_product_presentations?: ProductPresentation[];
}

export interface ProductPresentation {
  id: string;
  name: string;
  price: number;
  product_id: string;
}

export interface Store extends DBStore {
  welcome_message: string;
  auto_reply: boolean;
  business_hours: boolean;
  is_connected: boolean;
}

export interface Category extends DBCategory {}

export interface CartStore {
  items: CartItem[];
  total: number;
  isOpen: boolean;
  toggleCart: () => void;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface WhatsAppConnection extends DBWhatsAppConnection {}

export interface StoreSchedule extends DBStoreSchedule {}

export interface WhatsAppStats {
  total_messages: number;
  response_time_avg: number;
  customer_satisfaction: number;
  most_common_queries: string[];
}
