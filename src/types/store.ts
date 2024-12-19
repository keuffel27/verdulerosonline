import type { Database } from '../lib/database.types';

export interface Product {
  id: string;
  store_id: string;
  category_id?: string;
  name: string;
  description?: string;
  image_url?: string;
  status: 'active' | 'inactive';
  category?: Category;
  presentations: ProductPresentation[];
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  image_url?: string;
  order_index: number;
}

export interface ProductPresentation {
  id: string;
  product_id: string;
  unit_id: string;
  quantity: number;
  price: number;
  sale_price?: number;
  stock: number;
  status: 'active' | 'inactive';
  is_default: boolean;
  unit: MeasurementUnit;
}

export interface MeasurementUnit {
  id: string;
  name: string;
  symbol: string;
  system: 'metric' | 'imperial';
  base_unit: boolean;
  conversion_factor?: number;
  base_unit_id?: string;
}

export interface CartItem {
  product: Product;
  presentation: ProductPresentation;
  quantity: number;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  store_social_media?: {
    instagram_url?: string;
    facebook_url?: string;
    whatsapp_number?: string;
  };
}

export interface StoreAppearance {
  store_id: string;
  logo_url?: string;
  banner_url?: string;
  store_address?: string;
  welcome_text: string;
  created_at?: string;
  updated_at?: string;
}

export type StoreConfig = {
  name: string;
  logo?: string;
  background?: string;
  schedule: {
    [key: string]: {
      isOpen: boolean;
      morning: {
        open: string;
        close: string;
      };
      afternoon: {
        open: string;
        close: string;
      };
    };
  };
  delivery: {
    available: boolean;
    minAmount: number;
    fee: number;
    zones: {
      name: string;
      fee: number;
    }[];
  };
};

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  deliveryMethod: 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'transfer';
}

export interface CartState {
  items: CartItem[];
  customerInfo: CustomerInfo;
}

export interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, presentationId: string) => void;
  updateQuantity: (productId: string, presentationId: string, quantity: number) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}