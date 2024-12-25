import { useState } from 'react';
import { X, ShoppingBag, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/format';
import { useCart } from '../../hooks/useCart';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: Props) {
  const cart = useCart();

  const handleQuantityChange = (productId: string, presentationId: string, delta: number) => {
    const item = cart.items.find(
      i => i.product.id === productId && i.presentation.id === presentationId
    );
    if (!item) return;

    if (item.quantity + delta <= 0) {
      cart.removeItem(productId, presentationId);
    } else {
      cart.updateQuantity(productId, presentationId, item.quantity + delta);
    }
  };

  return (
    <div className="flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">Tu Carrito</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <ShoppingBag className="w-12 h-12 mb-3" />
            <p className="text-base font-medium">Tu carrito está vacío</p>
            <button
              onClick={onClose}
              className="mt-4 text-green-600 text-sm font-medium hover:text-green-700 
                       transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.presentation.id}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start p-3 bg-white rounded-lg border 
                         hover:border-green-200 transition-colors"
              >
                {item.product.image_url && (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-md object-cover mr-3"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.presentation.quantity} {item.presentation.unit.symbol}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(item.presentation.price)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(
                          item.product.id, 
                          item.presentation.id, 
                          -1
                        )}
                        className="p-1 rounded-full hover:bg-gray-100 
                                 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(
                          item.product.id, 
                          item.presentation.id, 
                          1
                        )}
                        className="p-1 rounded-full hover:bg-gray-100 
                                 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.items.length > 0 && (
        <div className="border-t bg-white p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Total</span>
            <span className="text-lg font-semibold">
              {formatCurrency(cart.total)}
            </span>
          </div>
          <a
            href="/checkout"
            className="block w-full bg-green-600 text-white py-3 rounded-lg
                     font-medium text-center hover:bg-green-700 transition-colors"
          >
            Ir al checkout
          </a>
        </div>
      )}
    </div>
  );
}
