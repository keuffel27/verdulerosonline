import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../stores/cart';

export const CartPortal: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCart();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  console.log('CartPortal rendered, isOpen:', isOpen, 'mounted:', mounted);

  if (!mounted || !isOpen) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        style={{ zIndex: 9998 }}
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 flex" 
        style={{ zIndex: 9999 }}
      >
        <div className="w-screen max-w-md transform transition-transform duration-300 ease-in-out">
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
              <h2 className="text-lg font-medium">Carrito de compras</h2>
              <button
                onClick={toggleCart}
                className="rounded-md p-2 hover:bg-gray-100 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <p className="text-center text-gray-500">El carrito está vacío</p>
              ) : (
                <ul className="divide-y">
                  {items.map((item) => (
                    <li key={item.product.id} className="py-4">
                      <div className="flex items-center gap-4">
                        {item.product.image_url && (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            ${item.product.price.toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                            })}
                            {' / '}
                            {item.product.presentation.quantity} {item.product.presentation.unit.symbol}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="rounded-md bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="rounded-md bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="sticky bottom-0 border-t bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-xl font-medium">
                    ${total().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const message = items
                      .map(
                        (item) =>
                          `${item.quantity}x ${item.product.name} (${item.product.presentation.quantity} ${item.product.presentation.unit.symbol}) - $${(
                            item.product.price * item.quantity
                          ).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                      )
                      .join('\n');

                    const totalText = `\nTotal: $${total().toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                    })}`;

                    const encodedMessage = encodeURIComponent(`Mi pedido:\n${message}${totalText}`);
                    window.open(`https://wa.me/+5491112345678?text=${encodedMessage}`);
                  }}
                  className="w-full rounded-md bg-green-600 py-2 text-white hover:bg-green-700"
                >
                  Hacer pedido por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const portalRoot = document.getElementById('cart-portal');
  if (!portalRoot) return null;

  return createPortal(content, portalRoot);
};
