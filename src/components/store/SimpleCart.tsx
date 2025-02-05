import { useState } from 'react';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';

export function SimpleCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, total } = useCart();

  const handleFinishOrder = () => {
    const orderSummary = items.map(item => 
      `${item.name} - ${item.presentation} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`
    ).join('\n');

    const message = `*Resumen del Pedido:*\n\n${orderSummary}\n\n*Total: ${formatCurrency(total)}*`;
    console.log('Pedido:', message);
    // Aquí podrías enviar el mensaje a WhatsApp o donde sea necesario
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl p-4 mb-4 w-96 max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Carrito ({items.length} items)</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.presentation}`} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.presentation}</p>
                      <p className="text-green-600 font-medium">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        Total: {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-gray-100 rounded text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t mt-4 pt-4 space-y-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
              <button
                onClick={handleFinishOrder}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Finalizar Pedido
              </button>
            </div>
          )}
        </div>
      )}
      
      <button
        className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShoppingCart className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>
    </div>
  );
}
