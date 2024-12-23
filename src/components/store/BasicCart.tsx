import { useEffect, useState } from 'react';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { simpleCart } from '../../utils/simpleCart';
import { formatCurrency } from '../../utils/format';

export function BasicCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(simpleCart.getItems());
  const [count, setCount] = useState(simpleCart.getCount());

  useEffect(() => {
    const unsubscribe = simpleCart.subscribe((newItems) => {
      setItems([...newItems]);
      setCount(simpleCart.getCount());
    });

    // Bloquear scroll cuando el carrito está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      unsubscribe();
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFinishOrder = () => {
    if (items.length === 0) return;

    const orderText = items
      .map(item => `${item.name} - ${item.presentation} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`)
      .join('\n');

    const total = simpleCart.getTotal();
    const message = `*Pedido:*\n\n${orderText}\n\n*Total: ${formatCurrency(total)}*`;
    console.log('Pedido finalizado:', message);
    alert('Pedido registrado! Mira la consola para ver los detalles');
    simpleCart.clear();
    setIsOpen(false);
  };

  const updateQuantity = (item: any, increment: number) => {
    const newQuantity = item.quantity + increment;
    if (newQuantity <= 0) {
      simpleCart.removeItem(item.id, item.presentation);
    } else {
      const updatedItem = { ...item, quantity: newQuantity };
      simpleCart.updateItem(updatedItem);
    }
  };

  return (
    <>
      {/* Overlay con efecto de desenfoque */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-0 right-0 z-50 md:bottom-6 md:right-6">
        {isOpen && (
          <div className="bg-white w-full md:w-[400px] md:rounded-2xl shadow-2xl 
                         md:mb-4 max-h-[85vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between 
                          bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Mi Carrito ({count})
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

            {/* Contenido del carrito */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Tu carrito está vacío</p>
                  <p className="text-sm text-gray-500">¡Agrega algunos productos para comenzar!</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {items.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-xl border border-gray-100 p-4 
                               hover:border-gray-200 transition-colors"
                    >
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.presentation}</p>
                          <div className="flex items-center gap-4 mt-3">
                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item, -1)}
                                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item, 1)}
                                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <span className="font-medium text-green-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => simpleCart.removeItem(item.id, item.presentation)}
                          className="text-gray-400 hover:text-red-500 transition-colors self-start"
                          aria-label="Eliminar producto"
                        >
                          <X className="w-5 h-5" />
                        </button>
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
                  <span className="text-gray-600">Total a pagar</span>
                  <span className="text-2xl font-semibold text-gray-900">
                    ${simpleCart.getTotal().toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleFinishOrder}
                  className="w-full bg-green-600 text-white py-4 rounded-xl 
                           hover:bg-green-700 active:bg-green-800
                           transition-colors font-medium text-base
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Finalizar Pedido
                </button>
              </div>
            )}
          </div>
        )}

        {/* Botón flotante del carrito */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 bg-green-600 text-white p-4 
                   rounded-full shadow-lg hover:bg-green-700 
                   hover:shadow-xl active:scale-95
                   transition-all duration-200"
          aria-label="Abrir carrito"
        >
          <ShoppingCart className="w-6 h-6" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                         text-xs font-bold rounded-full min-w-[24px] h-6 
                         flex items-center justify-center px-2
                         border-2 border-white shadow-sm">
              {count}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
