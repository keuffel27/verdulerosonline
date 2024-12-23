export interface CartItem {
  id: string;
  name: string;
  presentation: string;
  quantity: number;
  price: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export interface CheckoutFormData {
  recipientName: string;
  deliveryType: 'delivery' | 'pickup';
  address?: string;
  notes?: string;
}
