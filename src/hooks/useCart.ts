import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  product: {
    id: string;
    name: string;
    image_url?: string;
  };
  presentation: {
    id: string;
    price: number;
    quantity: number;
    unit: {
      symbol: string;
    };
  };
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, presentationId: string) => void;
  updateQuantity: (productId: string, presentationId: string, quantity: number) => void;
  clear: () => void;
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.presentation.price * item.quantity), 0);
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          item => 
            item.product.id === newItem.product.id && 
            item.presentation.id === newItem.presentation.id
        );

        let newItems;
        if (existingItemIndex > -1) {
          newItems = [...state.items];
          newItems[existingItemIndex].quantity += newItem.quantity;
        } else {
          newItems = [...state.items, newItem];
        }

        return { 
          items: newItems,
          total: calculateTotal(newItems)
        };
      }),

      removeItem: (productId, presentationId) => set((state) => {
        const newItems = state.items.filter(
          item => 
            item.product.id !== productId || 
            item.presentation.id !== presentationId
        );
        return {
          items: newItems,
          total: calculateTotal(newItems)
        };
      }),

      updateQuantity: (productId, presentationId, quantity) => set((state) => {
        const newItems = state.items.map(item => 
          item.product.id === productId && item.presentation.id === presentationId
            ? { ...item, quantity }
            : item
        );
        return {
          items: newItems,
          total: calculateTotal(newItems)
        };
      }),

      clear: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
