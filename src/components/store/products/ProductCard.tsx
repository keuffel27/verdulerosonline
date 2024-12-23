import { toast } from 'react-toastify';
import { formatCurrency } from '../../../utils/format';
import type { Product, ProductPresentation } from '../../../types/store';
import noImage from '../../../assets/no-image';
import { Plus } from 'lucide-react';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  if (!product || !product.presentations) {
    return null;
  }

  const activePresentations = product.presentations
    .filter(p => p.status === 'active')
    .sort((a, b) => a.price - b.price);

  if (activePresentations.length === 0 || product.status !== 'active') {
    return null;
  }

  const formatPresentation = (quantity: number, unit: { name: string, symbol: string }) => {
    if (quantity === 1000 && unit.symbol === 'g') return '1 kg';
    return `${quantity} ${unit.symbol}`;
  };

  const handleAddToCart = (presentation: ProductPresentation) => {
    // Obtener el carrito actual del localStorage o crear uno nuevo
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Buscar si el producto ya existe en el carrito
    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.productId === product.id && item.presentationId === presentation.id
    );

    if (existingItemIndex > -1) {
      // Si existe, incrementar la cantidad
      currentCart[existingItemIndex].quantity += 1;
    } else {
      // Si no existe, añadirlo
      currentCart.push({
        productId: product.id,
        presentationId: presentation.id,
        name: product.name,
        presentation: formatPresentation(presentation.quantity, presentation.unit),
        price: presentation.price,
        quantity: 1
      });
    }

    // Guardar el carrito actualizado
    localStorage.setItem('cart', JSON.stringify(currentCart));

    // Disparar un evento custom para notificar cambios en el carrito
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { cart: currentCart }
    }));

    // Feedback visual en el botón
    const button = document.querySelector(`[data-presentation-id="${presentation.id}"]`);
    if (button) {
      button.classList.add('scale-95', 'bg-green-600', 'text-white');
      setTimeout(() => {
        button.classList.remove('scale-95', 'bg-green-600', 'text-white');
      }, 200);
    }

    // Mostrar notificación
    toast.success(
      `${formatPresentation(presentation.quantity, presentation.unit)} de ${product.name} agregado al carrito`,
      {
        position: "bottom-right",
        autoClose: 2000
      }
    );
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Imagen con overlay al hover */}
      <div className="relative h-48 bg-gray-50">
        <img
          src={product.image_url || noImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Etiqueta de categoría */}
        {product.category && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {product.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-200">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Presentaciones */}
        <div className="mt-4 space-y-2">
          {activePresentations.map((presentation) => (
            <button
              key={presentation.id}
              data-presentation-id={presentation.id}
              onClick={() => handleAddToCart(presentation)}
              className="w-full px-4 py-2 rounded-lg border border-green-100 
                       bg-white text-gray-700 hover:border-green-500 hover:bg-green-50
                       transition-all duration-200 flex items-center justify-between
                       focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <div className="flex items-center">
                <Plus className="w-4 h-4 text-green-600 mr-2" />
                <span>{formatPresentation(presentation.quantity, presentation.unit)}</span>
              </div>
              <span className="font-medium text-green-600">
                {formatCurrency(presentation.price)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
