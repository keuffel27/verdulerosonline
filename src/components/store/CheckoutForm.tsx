import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, Store, CreditCard, Wallet, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

interface CheckoutFormProps {
  onClose: () => void;
  whatsappNumber: string;
  whatsappMessage?: string;
}

type DeliveryMethod = 'pickup' | 'delivery';
type PaymentMethod = 'cash' | 'transfer' | 'card';

interface FormData {
  recipientName: string;
  deliveryMethod: DeliveryMethod;
  address?: {
    street: string;
    number: string;
    reference: string;
  };
  paymentMethod: PaymentMethod;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onClose,
  whatsappNumber,
  whatsappMessage = ''
}) => {
  const { items, total } = useCart();
  const [formData, setFormData] = useState<FormData>({
    recipientName: '',
    deliveryMethod: 'pickup',
    paymentMethod: 'cash'
  });

  const generateWhatsAppMessage = () => {
    const emoji = {
      cart: '🛒',
      store: '🏪',
      truck: '🚚',
      money: '💰',
      name: '👤',
      location: '📍',
      note: '📝'
    };

    let message = `*¡Nuevo Pedido!* ${emoji.cart}\n\n`;
    
    // Información del cliente
    message += `*${emoji.name} Cliente:* ${formData.recipientName}\n\n`;
    
    // Método de entrega
    message += `*${formData.deliveryMethod === 'pickup' ? emoji.store : emoji.truck} Método de entrega:* ${
      formData.deliveryMethod === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'
    }\n`;
    
    // Dirección si es envío a domicilio
    if (formData.deliveryMethod === 'delivery' && formData.address) {
      message += `*${emoji.location} Dirección de entrega:*\n`;
      message += `• Calle: ${formData.address.street}\n`;
      message += `• Número: ${formData.address.number}\n`;
      message += `• Referencia: ${formData.address.reference}\n\n`;
    }
    
    // Método de pago
    message += `*${emoji.money} Método de pago:* ${
      formData.paymentMethod === 'cash' ? 'Efectivo' :
      formData.paymentMethod === 'transfer' ? 'Transferencia' : 'Tarjeta'
    }\n\n`;
    
    // Productos
    message += `*${emoji.cart} Detalle del pedido:*\n`;
    items.forEach(item => {
      message += `• ${item.quantity}x ${item.product.name} (${item.presentation.quantity} ${item.presentation.unit.symbol}) - $${item.presentation.price * item.quantity}\n`;
    });
    
    // Total
    message += `\n*${emoji.money} Total:* $${total}\n\n`;
    
    // Mensaje adicional si existe
    if (whatsappMessage) {
      message += `${emoji.note} *Nota:* ${whatsappMessage}\n`;
    }

    return encodeURIComponent(message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-auto relative"
    >
      {/* Botón de cerrar */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full text-red-500 
                 hover:bg-red-50 transition-colors"
      >
        <X className="w-5 h-5" />
      </motion.button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Finalizar Pedido</h2>
      
      {/* Resumen del carrito */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Resumen del pedido</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.presentation.id}`} 
                 className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.quantity}x {item.product.name} ({item.presentation.quantity} {item.presentation.unit.symbol})
              </span>
              <span className="font-medium">
                ${item.presentation.price * item.quantity}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 flex justify-between font-medium">
            <span>Total</span>
            <span className="text-green-600">${total}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre del destinatario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de quien recibe
          </label>
          <input
            type="text"
            required
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Nombre completo"
          />
        </div>

        {/* Método de entrega */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de entrega
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryMethod: 'pickup' })}
              className={`flex items-center justify-center p-4 border rounded-lg ${
                formData.deliveryMethod === 'pickup'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Store className="w-5 h-5 mr-2" />
              Retiro en local
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
              className={`flex items-center justify-center p-4 border rounded-lg ${
                formData.deliveryMethod === 'delivery'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Truck className="w-5 h-5 mr-2" />
              Envío a domicilio
            </button>
          </div>
        </div>

        {/* Formulario de dirección si es envío a domicilio */}
        {formData.deliveryMethod === 'delivery' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calle
              </label>
              <input
                type="text"
                required
                value={formData.address?.street || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value } as any
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Nombre de la calle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </label>
              <input
                type="text"
                required
                value={formData.address?.number || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, number: e.target.value } as any
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Número de casa o departamento"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia
              </label>
              <input
                type="text"
                required
                value={formData.address?.reference || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, reference: e.target.value } as any
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Entre calles o punto de referencia"
              />
            </div>
          </motion.div>
        )}

        {/* Método de pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de pago
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                formData.paymentMethod === 'cash'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Wallet className="w-5 h-5 mb-2" />
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                formData.paymentMethod === 'transfer'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Wallet className="w-5 h-5 mb-2" />
              Transferencia
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                formData.paymentMethod === 'card'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-2" />
              Tarjeta
            </button>
          </div>
        </div>

        {/* Botón de enviar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 
                   text-white font-medium rounded-lg hover:shadow-lg
                   transition-all duration-300"
        >
          REALIZAR PEDIDO AHORA MISMO
        </motion.button>
      </form>
    </motion.div>
  );
};
