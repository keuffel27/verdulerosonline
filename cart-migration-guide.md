# Guía de Migración del Carrito V15 a V16

## Flujo Actual Funcional (V15)

El flujo de compra actual funciona con estos 3 componentes principales:

1. `ProductCard.tsx`: Maneja la visualización y adición de productos al carrito
2. `FloatingCart.tsx`: Muestra el carrito flotante con el resumen
3. `CartDrawer.tsx`: Maneja el drawer lateral con detalles y checkout

## Archivos a Migrar

### 1. src/components/store/products/ProductCard.tsx
```typescript
import { formatCurrency } from '../../../utils/format';
import type { Product } from '../../../types/store';
import { useCart } from '../../../hooks/useCart';
import { ShoppingCart } from 'lucide-react';

interface Props {
  product: Product;
  onAddToCart: (product: Product, presentationId: string, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: Props) {
  const cart = useCart();

  if (!product?.presentations) return null;

  // Solo mostrar presentaciones activas
  const activePresentations = product.presentations
    .filter(p => p.status === 'active')
    .sort((a, b) => a.price - b.price);

  if (activePresentations.length === 0) return null;

  const handleAddToCart = (presentationId: string) => {
    const presentation = product.presentations.find(p => p.id === presentationId);
    if (!presentation) return;

    onAddToCart(product, presentationId, 1);

    // Feedback visual
    const button = document.querySelector(`[data-presentation-id="${presentationId}"]`);
    if (button) {
      button.classList.add('bg-green-600', 'text-white', 'scale-95');
      setTimeout(() => {
        button.classList.remove('bg-green-600', 'text-white', 'scale-95');
      }, 200);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Imagen del producto */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        
        {/* Presentaciones */}
        <div className="mt-4 space-y-2">
          {activePresentations.map((presentation) => (
            <button
              key={presentation.id}
              data-presentation-id={presentation.id}
              onClick={() => handleAddToCart(presentation.id)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 
                       flex items-center justify-between
                       hover:border-green-500 hover:text-green-600 
                       active:scale-95 transition-all duration-150"
            >
              <span className="text-sm">
                {presentation.quantity} {presentation.unit.symbol}
              </span>
              <span className="font-medium">
                {formatCurrency(presentation.price)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 2. src/components/store/FloatingCart.tsx
```typescript
import { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useCart } from '../../hooks/useCart';
import { CartDrawer } from './CartDrawer';

export function FloatingCart() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const cart = useCart();
  const itemCount = cart.items.length;

  if (itemCount === 0) return null;

  return (
    <>
      {/* Botón flotante del carrito */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-white rounded-full p-4 shadow-lg
                 hover:shadow-xl transition-all duration-300"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6 text-green-600" />
          <span className="absolute -top-2 -right-2 bg-green-500 text-white 
                        text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        </div>
      </button>

      {/* CartDrawer para el checkout */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
```

### 3. src/components/store/CartDrawer.tsx
```typescript
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
```

## Notas Importantes

1. El flujo de datos es:
   - `ProductCard` → Añade productos usando `onAddToCart`
   - `FloatingCart` → Muestra el contador y abre el `CartDrawer`
   - `CartDrawer` → Maneja el checkout y la información del cliente

2. Todos los componentes usan el hook `useCart` para acceder al estado del carrito

3. No hay necesidad de cambiar tecnologías ni lógicas, solo asegurarse que estos tres archivos estén correctamente implementados en la V16.

## Verificación Post-Migración

1. Verificar que se pueden añadir productos desde `ProductCard`
2. Verificar que el contador en `FloatingCart` se actualiza
3. Verificar que `CartDrawer` muestra los productos y permite modificar cantidades
4. Verificar que el total se calcula correctamente
