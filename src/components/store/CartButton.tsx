import React from 'react';
import { useCart } from '../../stores/cart';

export const CartButton = () => {
  const { toggleCart } = useCart();

  return (
    <button
      onClick={() => {
        console.log('Cart button clicked');
        toggleCart();
      }}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-green-500 p-4 text-white shadow-lg"
    >
      🛒 Abrir Carrito
    </button>
  );
};
