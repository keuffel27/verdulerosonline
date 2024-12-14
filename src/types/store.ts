export interface Category {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  image_url?: string;
  order_index: number;
  created_at?: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  unit: string;
  category_id?: string;
  image_url?: string;
  status: 'active' | 'inactive';
  package_sizes: string[];
  category?: Category;
  created_at?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  status: 'active' | 'inactive';
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  trial_start_date: string;
  created_at?: string;
  updated_at?: string;
  store_social_media?: {
    instagram_url?: string;
    facebook_url?: string;
    whatsapp_number?: string;
    whatsapp_message?: string;
  };
  store_appearance?: {
    logo_url?: string;
    banner_url?: string;
    primary_color?: string;
    secondary_color?: string;
  };
}

export interface StoreConfig {
  name: string;
  logo?: string;
  background?: string;
  schedule: WeekSchedule;
  social: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
  whatsappMessage: {
    header: string;
    footer: string;
    itemTemplate: string;
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
}

export interface DaySchedule {
  isOpen: boolean;
  morning: {
    open: string;
    close: string;
  };
  afternoon: {
    open: string;
    close: string;
  };
}

export interface WeekSchedule {
  [key: string]: DaySchedule;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  notes?: string;
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
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}