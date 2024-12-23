import React from 'react';
import { useCart } from '../../stores/cart';
import { ShoppingCart } from 'lucide-react';

export const CartButton = () => {
  const { toggleCart, items } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => {
        console.log('Cart button clicked');
        toggleCart();
      }}
      className="fixed bottom-6 right-6 z-50 bg-green-600 text-white rounded-full p-4 
                 shadow-lg hover:bg-green-700 transition-all duration-200 group relative"
    >
      {/* Icono del carrito */}
      <ShoppingCart className="w-6 h-6" />
      
      {/* Contador de items */}
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                    font-bold rounded-full w-6 h-6 flex items-center justify-center
                    border-2 border-white">
        {totalItems}
      </div>

      {/* Tooltip con el total */}
      <div className="absolute bottom-full right-0 mb-2 pointer-events-none
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-gray-900 text-white text-sm py-1 px-3 rounded-lg shadow-lg
                      whitespace-nowrap">
          Total: ${totalPrice.toFixed(2)}
        </div>
        <div className="border-8 border-transparent border-t-gray-900 
                      w-0 h-0 mx-auto"></div>
      </div>
    </button>
  );
};
