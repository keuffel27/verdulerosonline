import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { formatCurrency } from '../../utils/format';
import type { CartItem, CustomerInfo } from '../../types/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storeWhatsapp: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  storeWhatsapp,
}) => {
  const [step, setStep] = useState<'cart' | 'info'>('cart');
  const {
    items,
    customerInfo,
    removeItem,
    updateQuantity,
    updateCustomerInfo,
    clearCart,
    getTotal,
  } = useCartStore();

  const handleQuantityChange = (
    productId: string,
    size: string,
    action: 'increase' | 'decrease'
  ) => {
    const item = items.find(
      (i) => i.product.id === productId && i.size === size
    );
    if (!item) return;

    const newQuantity =
      action === 'increase' ? item.quantity + 1 : item.quantity - 1;

    if (newQuantity === 0) {
      removeItem(productId, size);
    } else {
      updateQuantity(productId, size, newQuantity);
    }
  };

  const handleSubmitOrder = () => {
    const { name, phone, address, deliveryMethod, paymentMethod } = customerInfo;
    
    if (!name || !phone || (deliveryMethod === 'delivery' && !address)) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const total = getTotal();
    const orderText = generateOrderText(items, customerInfo, total);
    
    const whatsappUrl = `https://wa.me/${storeWhatsapp}?text=${encodeURIComponent(
      orderText
    )}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    onClose();
  };

  const generateOrderText = (
    items: CartItem[],
    customerInfo: CustomerInfo,
    total: number
  ) => {
    const header = '🛍️ *Nuevo Pedido*\\n\\n';
    
    const itemsText = items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} (${item.size})\\n` +
          `   💰 ${formatCurrency(
            item.product.price *
              item.quantity *
              (item.size === '1kg' ? 1 : parseFloat(item.size) / 1000)
          )}` +
          (item.notes ? `\\n   📝 ${item.notes}` : '')
      )
      .join('\\n\\n');

    const customerText = `\\n\\n👤 *Datos del Cliente*\\n` +
      `• Nombre: ${customerInfo.name}\\n` +
      `• Teléfono: ${customerInfo.phone}\\n` +
      `• Método de entrega: ${
        customerInfo.deliveryMethod === 'pickup' ? '🏪 Retiro en tienda' : '🚚 Delivery'
      }` +
      (customerInfo.deliveryMethod === 'delivery'
        ? `\\n• Dirección: ${customerInfo.address}`
        : '') +
      `\\n• Método de pago: ${
        customerInfo.paymentMethod === 'cash' ? '💵 Efectivo' : '💳 Transferencia'
      }`;

    const footer = `\\n\\n💰 *Total: ${formatCurrency(total)}*`;

    return header + itemsText + customerText + footer;
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    updateCustomerInfo({ [field]: value });
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-green-600" />
              <span className="ml-2 text-lg font-medium">
                {step === 'cart' ? 'Tu Carrito' : 'Datos de Entrega'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'cart' ? (
              <>
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-gray-500">
                    <ShoppingBag className="mb-4 h-12 w-12" />
                    <p className="text-lg">Tu carrito está vacío</p>
                    <button
                      onClick={onClose}
                      className="mt-4 text-green-600 hover:text-green-700"
                    >
                      Seguir comprando
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}`}
                        className="flex items-center space-x-4 rounded-lg border p-4"
                      >
                        {item.product.image_url && (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.size} - {formatCurrency(item.product.price * (item.size === '1kg' ? 1 : parseFloat(item.size) / 1000))}
                          </p>
                          {item.notes && (
                            <p className="mt-1 text-sm text-gray-500">
                              Nota: {item.notes}
                            </p>
                          )}
                          <div className="mt-2 flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product.id,
                                  item.size,
                                  'decrease'
                                )
                              }
                              className="rounded-full p-1 hover:bg-gray-100"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product.id,
                                  item.size,
                                  'increase'
                                )
                              }
                              className="rounded-full p-1 hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.product.id, item.size)}
                              className="ml-auto rounded-full p-1 text-red-500 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Método de entrega
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="pickup"
                        name="deliveryMethod"
                        value="pickup"
                        checked={customerInfo.deliveryMethod === 'pickup'}
                        onChange={(e) =>
                          handleCustomerInfoChange('deliveryMethod', e.target.value)
                        }
                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label
                        htmlFor="pickup"
                        className="ml-3 block text-sm text-gray-700"
                      >
                        Retiro en tienda
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="delivery"
                        name="deliveryMethod"
                        value="delivery"
                        checked={customerInfo.deliveryMethod === 'delivery'}
                        onChange={(e) =>
                          handleCustomerInfoChange('deliveryMethod', e.target.value)
                        }
                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label
                        htmlFor="delivery"
                        className="ml-3 block text-sm text-gray-700"
                      >
                        Delivery
                      </label>
                    </div>
                  </div>
                </div>

                {customerInfo.deliveryMethod === 'delivery' && (
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Dirección
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) =>
                        handleCustomerInfoChange('address', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Método de pago
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cash"
                        name="paymentMethod"
                        value="cash"
                        checked={customerInfo.paymentMethod === 'cash'}
                        onChange={(e) =>
                          handleCustomerInfoChange('paymentMethod', e.target.value)
                        }
                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label
                        htmlFor="cash"
                        className="ml-3 block text-sm text-gray-700"
                      >
                        Efectivo
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="transfer"
                        name="paymentMethod"
                        value="transfer"
                        checked={customerInfo.paymentMethod === 'transfer'}
                        onChange={(e) =>
                          handleCustomerInfoChange('paymentMethod', e.target.value)
                        }
                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label
                        htmlFor="transfer"
                        className="ml-3 block text-sm text-gray-700"
                      >
                        Transferencia
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {items.length} items en tu carrito
            </p>
            <div className="mt-4 flex space-x-3">
              {step === 'cart' ? (
                <>
                  <button
                    onClick={() => setStep('info')}
                    disabled={items.length === 0}
                    className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStep('cart')}
                    className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Confirmar pedido
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
