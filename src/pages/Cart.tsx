import React from 'react';
import { useParams } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { Button } from '../components/ui/Button';
import { Trash2 } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

export const Cart: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { items, removeItem, updateQuantity, total } = useCartStore();

  const handleWhatsAppCheckout = () => {
    const message = `¡Hola! Quiero hacer el siguiente pedido:\n\n${items
      .map(
        (item) =>
          `- ${item.product.name} (${item.quantity} ${item.product.unit}): $${
            item.product.price * item.quantity
          }`
      )
      .join('\n')}\n\nTotal: $${total()}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="p-4">
        <BackButton to={`/store/${storeId}`} className="mb-4" />
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600">¡Agrega algunos productos para comenzar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <BackButton to={`/store/${storeId}`} className="mb-4" />
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between py-4 border-b"
          >
            <div className="flex items-center space-x-4">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-gray-600">
                  ${item.product.price}/{item.product.unit}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.product.id, parseInt(e.target.value))
                }
                className="w-20 px-2 py-1 border rounded"
              />
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-xl font-bold">Total: ${total()}</div>
          <Button variant="primary" size="lg" onClick={handleWhatsAppCheckout}>
            Finalizar Compra por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};