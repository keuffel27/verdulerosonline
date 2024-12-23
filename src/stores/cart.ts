import { create } from 'zustand';

interface CartStore {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  isOpen: true, // Empezamos con el carrito abierto
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
