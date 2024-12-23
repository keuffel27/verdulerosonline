import { create } from 'zustand';

interface CartUIStore {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartUIStore = create<CartUIStore>()((set) => ({
  isOpen: false,
  openCart: () => {
    console.log('Opening cart from store...');
    set({ isOpen: true });
    console.log('Cart state after opening:', { isOpen: true });
  },
  closeCart: () => {
    console.log('Closing cart from store...');
    set({ isOpen: false });
    console.log('Cart state after closing:', { isOpen: false });
  },
}));
