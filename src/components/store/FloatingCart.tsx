import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

export function FloatingCart() {
  const { items } = useCartStore();
  const itemCount = items.length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors relative"
        onClick={() => {
          // TODO: Implementar apertura del carrito
          console.log('Abrir carrito');
        }}
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
    </div>
  );
}
