import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartState, CartActions } from '../types/store';

type Product = CartItem['product'];
type ProductPresentation = CartItem['presentation'];

interface CartItem {
  product: Product;
  presentation: ProductPresentation;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    deliveryMethod: string;
    paymentMethod: string;
  };
}

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, presentationId: string) => void;
  updateQuantity: (productId: string, presentationId: string, quantity: number) => void;
  updateCustomerInfo: (info: Partial<CartState['customerInfo']>) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      customerInfo: {
        name: '',
        phone: '',
        address: '',
        deliveryMethod: 'pickup',
        paymentMethod: 'cash',
      },

      addItem: (newItem) => {
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

      updateCustomerInfo: (info) => {
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...info },
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.presentation.price * item.quantity,
          0
        );
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
