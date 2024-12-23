import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { simpleCart } from '../../utils/simpleCart';
import { formatCurrency } from '../../utils/format';

export function BasicCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(simpleCart.getItems());
  const [count, setCount] = useState(simpleCart.getCount());

  useEffect(() => {
    // Suscribirse a cambios en el carrito
    const unsubscribe = simpleCart.subscribe((newItems) => {
      console.log('Cart updated:', newItems);
      setItems([...newItems]);
      setCount(simpleCart.getCount());
    });

    return unsubscribe;
  }, []);

  const handleFinishOrder = () => {
    if (items.length === 0) return;

    const orderText = items
      .map(item => `${item.name} - ${item.presentation} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`)
      .join('\n');

    const total = simpleCart.getTotal();
    const message = `*Pedido:*\n\n${orderText}\n\n*Total: ${formatCurrency(total)}*`;
    
    // Log del pedido
    console.log('Pedido finalizado:', message);
    
    // Aquí podrías enviar a WhatsApp o donde necesites
    alert('Pedido registrado! Mira la consola para ver los detalles');
    
    // Limpiar carrito
    simpleCart.clear();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl p-4 mb-4 w-80">
          <h3 className="font-bold mb-4">Carrito ({count} items)</h3>
          
          {items.length === 0 ? (
            <p className="text-gray-500">Carrito vacío</p>
          ) : (
            <>
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-start mb-2 pb-2 border-b">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.presentation}</p>
                    <p className="text-sm">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => simpleCart.removeItem(item.id, item.presentation)}
                    className="text-red-500 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">{formatCurrency(simpleCart.getTotal())}</span>
                </div>
                
                <button
                  onClick={handleFinishOrder}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  Finalizar Pedido
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 relative"
      >
        <ShoppingCart />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
