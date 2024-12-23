import React from 'react';
import { useCart } from '../../../hooks/useCart';
import { CartItem } from '../../../types/supabase';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

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
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tu Carrito</h2>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400">¡Agrega algunos productos!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatCurrency(item.product.price)} / {item.product.unit_type}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Eliminar producto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - (item.product.quantity_step || 0.1))}
                        className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="text-sm font-medium min-w-[4rem] text-center">
                        {item.quantity.toFixed(3)} {item.product.unit_type}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + (item.product.quantity_step || 0.1))}
                        className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all"
                        disabled={item.product.max_quantity ? item.quantity >= item.product.max_quantity : false}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.product.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 bg-white/80 backdrop-blur-sm sticky bottom-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-xl font-semibold text-gray-900">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={() => {
                // TODO: Implementar checkout
                alert('Implementar checkout');
              }}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 
                       transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <ShoppingBag className="w-5 h-5" />
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </>
  );
};
