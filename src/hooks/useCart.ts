import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types/store';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, presentationId: string) => void;
  updateQuantity: (productId: string, presentationId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        console.log('Adding item to cart:', newItem); // Debug log
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            item => 
              item.product.id === newItem.product.id && 
              item.presentation.id === newItem.presentation.id
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, presentationId) => {
        set((state) => ({
          items: state.items.filter(
            item => !(item.product.id === productId && item.presentation.id === presentationId)
          ),
        }));
      },

      updateQuantity: (productId, presentationId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId && item.presentation.id === presentationId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          return total + (item.presentation.price * item.quantity);
        }, 0);
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Si es necesario migrar datos antiguos
          return { items: [] };
        }
        return persistedState as CartStore;
      },
    }
  )
);
