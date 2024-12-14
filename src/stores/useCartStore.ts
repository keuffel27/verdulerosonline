import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem, Product } from '../types/store';

interface CartStore extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  updateNotes: (productId: string, size: string, notes: string) => void;
  updateCustomerInfo: (info: Partial<CartState['customerInfo']>) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const initialState: CartState = {
  items: [],
  customerInfo: {
    name: '',
    phone: '',
    address: '',
    deliveryMethod: 'pickup',
    paymentMethod: 'cash',
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.product.id === item.product.id && i.size === item.size
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += item.quantity;
            return { items: newItems };
          }

          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        }));
      },

      updateQuantity: (productId, size, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      updateNotes: (productId, size, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, notes }
              : item
          ),
        }));
      },

      updateCustomerInfo: (info) => {
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...info },
        }));
      },

      clearCart: () => {
        set(initialState);
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.product.price;
          const sizeMultiplier = getSizeMultiplier(item.size);
          return total + price * item.quantity * sizeMultiplier;
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

function getSizeMultiplier(size: string): number {
  const sizeMap: { [key: string]: number } = {
    '100gr': 0.1,
    '250gr': 0.25,
    '500gr': 0.5,
    '1kg': 1,
  };
  return sizeMap[size] || 1;
}