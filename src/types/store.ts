import type { Database } from '../lib/database.types';

export type Product = Database['public']['Tables']['store_products']['Row'] & {
  presentations: (Database['public']['Tables']['product_presentations']['Row'] & {
    unit: Database['public']['Tables']['measurement_units']['Row']
  })[];
  category?: Database['public']['Tables']['store_categories']['Row'];
};

export type Category = Database['public']['Tables']['store_categories']['Row'];

export type Store = Database['public']['Tables']['stores']['Row'] & {
  store_social_media?: {
    instagram_url?: string;
    facebook_url?: string;
    whatsapp_number?: string;
  };
};

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

export interface CartItem {
  product: Product;
  presentation: Database['public']['Tables']['product_presentations']['Row'] & {
    unit: Database['public']['Tables']['measurement_units']['Row']
  };
  quantity: number;
}

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