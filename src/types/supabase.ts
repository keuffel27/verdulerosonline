import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Database Types
export type DBStore = Tables<'stores'>;
export type DBStoreAppearance = Tables<'store_appearance'>;
export type DBStoreSocialMedia = Tables<'store_social_media'>;
export type DBStoreSettings = Tables<'store_settings'>;
export type DBProduct = Tables<'products'>;
export type DBCategory = Tables<'categories'>;

// Frontend Types
export interface Store extends DBStore {
  store_appearance?: DBStoreAppearance;
  store_social_media?: DBStoreSocialMedia;
  store_settings?: DBStoreSettings;
  categories?: Category[];
  products?: Product[];
}

export interface Product extends DBProduct {
  category?: Category;
}

export interface Category extends DBCategory {
  products?: Product[];
}

export interface StoreSocialMedia extends DBStoreSocialMedia {}

export interface StoreAppearance extends DBStoreAppearance {}

export interface StoreSettings extends DBStoreSettings {}
