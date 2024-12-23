import { useState } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { useSimpleCart } from '../../stores/simpleCartStore';
import { formatCurrency } from '../../utils/format';

export function SimpleFloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, total } = useSimpleCart();

  const handleFinishOrder = () => {
    if (items.length === 0) return;

    const orderSummary = items
      .map(item => `${item.name} - ${item.presentation} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`)
      .join('\n');

    const message = `*Resumen del Pedido:*\n\n${orderSummary}\n\n*Total: ${formatCurrency(total)}*`;
    console.log('Pedido:', message);
    // Aquí podrías enviar el mensaje a WhatsApp o donde sea necesario
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Overlay cuando el carrito está abierto */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Panel del carrito */}
        {isOpen && (
          <div className="bg-white rounded-2xl shadow-xl mb-4 w-full sm:w-96 max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">
                  Tu Carrito ({totalItems})
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">Tu carrito está vacío</p>
                  <p className="text-sm text-gray-400">¡Agrega algunos productos!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.presentation}`}
                      className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.presentation}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.presentation)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                          <span className="text-sm font-medium px-3">
                            {item.quantity}x
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer con total y botón de finalizar */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-white/80 backdrop-blur-sm sticky bottom-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
                <button
                  onClick={handleFinishOrder}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg 
                           hover:bg-green-700 transition-colors flex items-center 
                           justify-center gap-2 font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Finalizar Pedido
                </button>
              </div>
            )}
          </div>
        )}

        {/* Botón flotante del carrito */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-600 text-white p-4 rounded-full shadow-lg 
                   hover:bg-green-700 transition-all duration-200 relative
                   hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                         text-xs font-bold rounded-full w-6 h-6 
                         flex items-center justify-center border-2 border-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
