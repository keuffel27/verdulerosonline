import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  presentation: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, presentation: string) => void;
  clearCart: () => void;
  total: number;
}

export const useSimpleCart = create<CartStore>((set, get) => ({
  items: [],
  addItem: (newItem) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        item => item.id === newItem.id && item.presentation === newItem.presentation
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += 1;
        return { items: newItems };
      }

      return { items: [...state.items, { ...newItem, quantity: 1 }] };
    });
  },
  removeItem: (id, presentation) => {
    set((state) => ({
      items: state.items.filter(item => !(item.id === id && item.presentation === presentation))
    }));
  },
  clearCart: () => set({ items: [] }),
  get total() {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}));
