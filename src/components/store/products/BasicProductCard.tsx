import { formatCurrency } from '../../../utils/format';
import type { Product } from '../../../types/store';
import noImage from '../../../assets/no-image';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../../hooks/useCart';

interface Props {
  product: Product;
}

export function BasicProductCard({ product }: Props) {
  const { addItem } = useCart();

  if (!product?.presentations) return null;

  // Solo mostrar presentaciones activas
  const activePresentations = product.presentations
    .filter(p => p.status === 'active')
    .sort((a, b) => a.price - b.price);

  if (activePresentations.length === 0) return null;

  const formatPresentation = (quantity: number, unit: { symbol: string }) => {
    return quantity === 1000 && unit.symbol === 'g' 
      ? '1 kg' 
      : `${quantity} ${unit.symbol}`;
  };

  const handleAddToCart = (presentationId: string) => {
    const presentation = product.presentations.find(p => p.id === presentationId);
    if (!presentation) return;

    addItem({
      product: {
        id: product.id,
        name: product.name,
        image_url: product.image_url
      },
      presentation: {
        id: presentation.id,
        price: presentation.price,
        quantity: presentation.quantity,
        unit: presentation.unit
      },
      quantity: 1
    });

    // Feedback visual mejorado
    const button = document.querySelector(`[data-presentation-id="${presentationId}"]`);
    if (button) {
      button.classList.add('bg-green-600', 'text-white', 'scale-95');
      setTimeout(() => {
        button.classList.remove('bg-green-600', 'text-white', 'scale-95');
      }, 200);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
        {/* Imagen del producto */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image_url || noImage}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Presentaciones */}
          <div className="space-y-2">
            {activePresentations.map((presentation) => (
              <button
                key={presentation.id}
                data-presentation-id={presentation.id}
                onClick={() => handleAddToCart(presentation.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-200 
                         hover:border-green-500 hover:shadow-md transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
                         active:scale-95"
              >
                <span className="text-sm text-gray-600">
                  {formatPresentation(presentation.quantity, presentation.unit)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-green-600">
                    {formatCurrency(presentation.price)}
                  </span>
                  <ShoppingCart className="w-4 h-4 text-green-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
