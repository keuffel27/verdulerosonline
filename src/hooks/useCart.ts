import { create } from 'zustand';
import { CartItem, Product } from '../types/supabase';

interface CartStore {
  items: CartItem[];
  total: number;
  isOpen: boolean;
  toggleCart: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  total: 0,
  isOpen: false,
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + product.price,
        };
      }
      return {
        items: [...state.items, { ...product, quantity: 1 }],
        total: state.total + product.price,
      };
    }),
  removeFromCart: (productId) =>
    set((state) => {
      const item = state.items.find((item) => item.id === productId);
      if (!item) return state;
      return {
        items: state.items.filter((item) => item.id !== productId),
        total: state.total - item.price * item.quantity,
      };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const item = state.items.find((item) => item.id === productId);
      if (!item) return state;
      const quantityDiff = quantity - item.quantity;
      return {
        items: state.items.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        ),
        total: state.total + item.price * quantityDiff,
      };
    }),
  clearCart: () => set({ items: [], total: 0 }),
}));
