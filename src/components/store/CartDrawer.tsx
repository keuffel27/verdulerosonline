import { useState } from 'react';
import { X, ShoppingBag, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useCart } from '../../hooks/useCart';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: Props) {
  const cart = useCart();
  const [step, setStep] = useState<'cart' | 'info'>('cart');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

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

  const handleSubmitOrder = () => {
    // Aquí va la lógica de envío del pedido
    cart.clear();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-medium">
              {step === 'cart' ? 'Carrito de Compras' : 'Información de Entrega'}
            </h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'cart' ? (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={`${item.product.id}-${item.presentation.id}`} 
                       className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.presentation.quantity} {item.presentation.unit.symbol}
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.presentation.price)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(
                          item.product.id, 
                          item.presentation.id, 
                          -1
                        )}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(
                          item.product.id, 
                          item.presentation.id, 
                          1
                        )}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ 
                    ...prev, 
                    name: e.target.value 
                  }))}
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ 
                    ...prev, 
                    phone: e.target.value 
                  }))}
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ 
                    ...prev, 
                    address: e.target.value 
                  }))}
                  className="w-full p-2 border rounded-lg"
                />
                <textarea
                  placeholder="Notas adicionales"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total</span>
              <span className="font-medium">
                {formatCurrency(cart.total)}
              </span>
            </div>
            
            {step === 'cart' ? (
              <button
                onClick={() => setStep('info')}
                disabled={cart.items.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg 
                         flex items-center justify-center space-x-2 
                         disabled:opacity-50"
              >
                <span>Continuar</span>
              </button>
            ) : (
              <button
                onClick={handleSubmitOrder}
                disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
                className="w-full bg-green-600 text-white py-3 rounded-lg 
                         flex items-center justify-center space-x-2 
                         disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Finalizar Pedido</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
