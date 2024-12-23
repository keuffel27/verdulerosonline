import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductPresentation } from '../types/store';

interface CartItem {
  product: Product;
  presentation: ProductPresentation;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, presentationId: string) => void;
  updateQuantity: (productId: string, presentationId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            item => 
              item.product.id === newItem.product.id && 
              item.presentation.id === newItem.presentation.id
          );

          const newItems = [...state.items];

          if (existingItemIndex >= 0) {
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + newItem.quantity
            };
          } else {
            newItems.push({ ...newItem });
          }

          return { items: newItems };
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
        if (quantity <= 0) {
          get().removeItem(productId, presentationId);
          return;
        }
        
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
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
