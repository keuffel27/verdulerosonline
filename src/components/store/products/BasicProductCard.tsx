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
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Imagen con overlay al hacer hover */}
      <div className="relative h-48 bg-gray-50">
        <img
          src={product.image_url || noImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        )}

        {/* Presentaciones */}
        <div className="space-y-2 mt-auto">
          {activePresentations.map((presentation) => (
            <button
              key={presentation.id}
              data-presentation-id={presentation.id}
              onClick={() => handleAddToCart(presentation.id)}
              className="w-full px-4 py-2.5 rounded-lg border border-green-500/30 
                       bg-white text-green-700 hover:bg-green-50 active:bg-green-100
                       transition-all duration-200 flex justify-between items-center
                       hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                <span>{formatPresentation(presentation.quantity, presentation.unit)}</span>
              </div>
              <span className="font-medium">{formatCurrency(presentation.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
