import React, { useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';
import { generateWhatsAppMessage } from '../utils/whatsappMessage';
import { getStoreWhatsapp } from '../services/storeConfig';

interface CheckoutFormProps {
  storeId: string;
  onClose?: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ storeId, onClose }) => {
  const { items, clearCart } = useCartStore();
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [formData, setFormData] = useState({
    recipientName: '',
    deliveryType: 'delivery' as 'delivery' | 'pickup',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const loadWhatsappNumber = async () => {
      const number = await getStoreWhatsapp(storeId);
      if (number) {
        setWhatsappNumber(number);
      } else {
        console.error('No se encontró el número de WhatsApp de la tienda');
      }
    };
    loadWhatsappNumber();
  }, [storeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsappNumber) {
      alert('Error: No se ha configurado el número de WhatsApp de la tienda');
      return;
    }
    
    const whatsappUrl = generateWhatsAppMessage(items, formData, whatsappNumber);
    
    clearCart();
    if (onClose) onClose();
    
    window.location.href = whatsappUrl;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
          Nombre del destinatario *
        </label>
        <input
          type="text"
          id="recipientName"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          value={formData.recipientName}
          onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tipo de entrega *
        </label>
        <div className="mt-2 space-y-2">
          <div>
            <input
              type="radio"
              id="delivery"
              name="deliveryType"
              value="delivery"
              checked={formData.deliveryType === 'delivery'}
              onChange={(e) => setFormData({ ...formData, deliveryType: 'delivery' })}
              className="mr-2"
            />
            <label htmlFor="delivery">Envío a domicilio</label>
          </div>
          <div>
            <input
              type="radio"
              id="pickup"
              name="deliveryType"
              value="pickup"
              checked={formData.deliveryType === 'pickup'}
              onChange={(e) => setFormData({ ...formData, deliveryType: 'pickup' })}
              className="mr-2"
            />
            <label htmlFor="pickup">Retiro en local físico</label>
          </div>
        </div>
      </div>

      {formData.deliveryType === 'delivery' && (
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Dirección de entrega *
          </label>
          <input
            type="text"
            id="address"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notas adicionales
        </label>
        <textarea
          id="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Finalizar Compra
        </button>
      </div>
    </form>
  );
};
