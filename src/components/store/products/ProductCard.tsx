import { toast } from 'react-toastify';
import { formatCurrency } from '../../../utils/format';
import type { Product, ProductPresentation } from '../../../types/store';
import noImage from '../../../assets/no-image';

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

    // Mostrar notificación
    toast.success(
      `${formatPresentation(presentation.quantity, presentation.unit)} de ${product.name} agregado al carrito`,
      {
        position: "bottom-right",
        autoClose: 2000
      }
    );

    // Feedback visual en el botón
    const button = document.querySelector(`[data-presentation-id="${presentation.id}"]`);
    if (button) {
      button.classList.add('bg-green-500', 'text-white');
      setTimeout(() => {
        button.classList.remove('bg-green-500', 'text-white');
      }, 200);
    }
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-green-100/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
      {/* Imagen del producto */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
          <img
            src={product.image_url || noImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {product.category && (
          <span className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Presentaciones */}
        <div className="space-y-2">
          {activePresentations.map((presentation) => (
            <button
              key={presentation.id}
              data-presentation-id={presentation.id}
              onClick={() => handleAddToCart(presentation)}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 
                       bg-white border-2 border-green-500 text-green-600 hover:bg-green-500 
                       hover:text-white flex items-center justify-between"
            >
              <span>{formatPresentation(presentation.quantity, presentation.unit)}</span>
              <span className="font-bold">{formatCurrency(presentation.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
