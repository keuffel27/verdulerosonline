import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { Button } from '../components/ui/Button';
import { Trash2 } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface StoreSocialMedia {
  whatsapp_number: string;
  whatsapp_message: string;
}

export const Cart: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storeSocialMedia, setStoreSocialMedia] = useState<StoreSocialMedia | null>(null);

  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    paymentMethod: 'efectivo',
    needsDelivery: false,
    deliveryAddress: ''
  });

  // Cargar información de la tienda
  useEffect(() => {
    async function loadStoreInfo() {
      if (!storeId) return;

      try {
        const { data, error } = await supabase
          .from('store_social_media')
          .select('whatsapp_number, whatsapp_message')
          .eq('store_id', storeId)
          .single();

        if (error) throw error;
        setStoreSocialMedia(data);
      } catch (error) {
        console.error('Error loading store info:', error);
        toast.error('Error al cargar la información de la tienda');
      }
    }

    loadStoreInfo();
  }, [storeId]);

  const handleCheckout = async () => {
    if (!storeSocialMedia?.whatsapp_number) {
      toast.error('No se encontró el número de WhatsApp de la tienda');
      return;
    }

    if (!checkoutData.customerName) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }

    if (checkoutData.needsDelivery && !checkoutData.deliveryAddress) {
      toast.error('Por favor ingresa la dirección de envío');
      return;
    }

    const message = `🛒 *Nuevo Pedido*\n\n` +
      `*Cliente:* ${checkoutData.customerName}\n` +
      `*Método de Pago:* ${checkoutData.paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'}\n` +
      (checkoutData.needsDelivery 
        ? `*Envío a Domicilio*\n*Dirección:* ${checkoutData.deliveryAddress}\n` 
        : '*Retiro en Tienda*\n') +
      `\n*Productos:*\n${items.map(item => 
        `- ${item.quantity}x ${item.product.name} ($${item.product.price}/${item.product.unit}): $${item.product.price * item.quantity}`
      ).join('\n')}\n\n` +
      `*Total:* $${total()}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${storeSocialMedia.whatsapp_number}?text=${encodedMessage}`, '_blank');
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
        {/* Lista de productos */}
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

        {/* Total y botón de checkout */}
        <div className="mt-6">
          <div className="text-xl font-bold mb-4">Total: ${total()}</div>
          
          {!showCheckoutForm ? (
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setShowCheckoutForm(true)}
              className="w-full"
            >
              Continuar con la Compra
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Formulario de checkout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={checkoutData.customerName}
                  onChange={(e) => setCheckoutData({...checkoutData, customerName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  value={checkoutData.paymentMethod}
                  onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="needsDelivery"
                  checked={checkoutData.needsDelivery}
                  onChange={(e) => setCheckoutData({...checkoutData, needsDelivery: e.target.checked})}
                  className="rounded text-green-600"
                />
                <label htmlFor="needsDelivery" className="text-sm font-medium text-gray-700">
                  Envío a domicilio
                </label>
              </div>

              {checkoutData.needsDelivery && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección de Envío
                  </label>
                  <textarea
                    value={checkoutData.deliveryAddress}
                    onChange={(e) => setCheckoutData({...checkoutData, deliveryAddress: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder="Dirección completa para el envío"
                    required
                  />
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckout}
                className="w-full"
                disabled={loading || !storeSocialMedia?.whatsapp_number}
              >
                {loading ? 'Procesando...' : 'Finalizar Compra por WhatsApp'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};