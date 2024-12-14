import React from 'react';
import { useCart } from '../../../hooks/useCart';
import { CartItem } from '../../../types/supabase';

export const CartDrawer: React.FC = () => {
  const { items, total, isOpen, toggleCart, updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg p-6 transform transition-transform">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Carrito de Compras</h2>
        <button
          onClick={toggleCart}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Tu carrito está vacío
          </p>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="flex items-center py-4 border-b">
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-gray-500">{item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item, item.quantity - (item.product.quantity_step || 0.1))}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  -
                </button>
                <span>{item.quantity.toFixed(3)} {item.product.unit_type}</span>
                <button
                  onClick={() => handleQuantityChange(item, item.quantity + (item.product.quantity_step || 0.1))}
                  className="p-1 rounded-full hover:bg-gray-100"
                  disabled={item.product.max_quantity ? item.quantity >= item.product.max_quantity : false}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        {items.length > 0 && (
          <div className="flex justify-between mb-4">
            <span className="font-medium">Total</span>
            <span className="font-bold">{total.toFixed(2)}</span>
          </div>
        )}
        {items.length > 0 && (
          <button
            onClick={() => {
              // TODO: Implementar checkout
              alert('Implementar checkout');
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Finalizar Compra
          </button>
        )}
      </div>
    </div>
  );
};
