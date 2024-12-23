import { formatCurrency } from '../../../utils/format';
import { simpleCart } from '../../../utils/simpleCart';
import type { Product } from '../../../types/store';
import noImage from '../../../assets/no-image';

interface Props {
  product: Product;
}

export function BasicProductCard({ product }: Props) {
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

    const formattedPresentation = formatPresentation(presentation.quantity, presentation.unit);

    simpleCart.addItem({
      id: product.id,
      name: product.name,
      presentation: formattedPresentation,
      price: presentation.price
    });

    // Feedback visual simple
    const button = document.querySelector(`[data-presentation-id="${presentationId}"]`);
    if (button) {
      button.classList.add('bg-green-500', 'text-white');
      setTimeout(() => {
        button.classList.remove('bg-green-500', 'text-white');
      }, 200);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Imagen */}
      <div className="h-48 bg-gray-100">
        <img
          src={product.image_url || noImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        )}

        {/* Presentaciones */}
        <div className="space-y-2">
          {activePresentations.map((presentation) => (
            <button
              key={presentation.id}
              data-presentation-id={presentation.id}
              onClick={() => handleAddToCart(presentation.id)}
              className="w-full px-4 py-2 rounded border-2 border-green-500 
                         text-green-600 hover:bg-green-500 hover:text-white
                         transition-colors duration-200 flex justify-between items-center"
            >
              <span>{formatPresentation(presentation.quantity, presentation.unit)}</span>
              <span className="font-bold">{formatCurrency(presentation.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
