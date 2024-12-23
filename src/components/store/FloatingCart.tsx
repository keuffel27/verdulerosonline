import { useState, useEffect } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface CartItem {
  productId: string;
  presentationId: string;
  name: string;
  presentation: string;
  price: number;
  quantity: number;
}

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Cargar carrito inicial
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setItems(cart);
      setItemCount(cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0));
    }

    // Escuchar cambios en el carrito
    const handleCartUpdate = (event: CustomEvent<{ cart: CartItem[] }>) => {
      console.log('Cart updated:', event.detail.cart);
      setItems(event.detail.cart);
      setItemCount(event.detail.cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  const removeItem = (productId: string, presentationId: string) => {
    const newItems = items.filter(
      item => !(item.productId === productId && item.presentationId === presentationId)
    );
    localStorage.setItem('cart', JSON.stringify(newItems));
    setItems(newItems);
    setItemCount(newItems.reduce((sum, item) => sum + item.quantity, 0));
    
    // Notificar cambios
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { cart: newItems }
    }));
  };

  const handleFinishOrder = () => {
    if (items.length === 0) return;

    const orderText = items
      .map(item => `${item.name} - ${item.presentation} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`)
      .join('\n');

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `*Pedido:*\n\n${orderText}\n\n*Total: ${formatCurrency(total)}*`;
    
    console.log('Pedido finalizado:', message);
    alert('Pedido registrado! Mira la consola para ver los detalles');
    
    // Limpiar carrito
    localStorage.setItem('cart', '[]');
    setItems([]);
    setItemCount(0);
    setIsOpen(false);
  };

  if (itemCount === 0 && !isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl p-4 mb-4 w-96 max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              Carrito ({itemCount} items)
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.presentation}</p>
                    <p className="text-green-600 font-medium">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.presentationId)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold mb-4">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatCurrency(items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                  </span>
                </div>
                <button
                  onClick={handleFinishOrder}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors relative"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
    </div>
  );
}
