import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../../utils/format';
import type { Product, ProductPresentation } from '../../../types/store';
import noImage from '../../../assets/no-image';
import { Plus, Minus } from 'lucide-react';

interface Props {
  product: Product;
  onAddToCart: (presentationId: string, quantity: number) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const [selectedPresentation, setSelectedPresentation] = useState<ProductPresentation | null>(
    product.presentations.find(p => p.is_default && p.status === 'active') || 
    product.presentations.find(p => p.status === 'active') || 
    null
  );
  const [quantity, setQuantity] = useState(1);

  // Filtrar solo presentaciones activas y ordenar por precio
  const activePresentations = product.presentations
    .filter(p => p.status === 'active')
    .sort((a, b) => a.price - b.price);

  if (activePresentations.length === 0 || product.status !== 'active') {
    return null;
  }

  const basePrice = activePresentations[0].price / activePresentations[0].quantity;
  const baseUnit = activePresentations[0].unit;

  // Función para formatear la presentación
  const formatPresentation = (quantity: number, unit: string) => {
    if (quantity === 1000 && unit === 'g') return '1 kg';
    return `${quantity} ${unit}`;
  };

  // Función para manejar la selección de presentación
  const handlePresentationSelect = (presentation: ProductPresentation) => {
    onAddToCart(presentation.id, 1);
    toast.success('Producto agregado al carrito');
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
          <span className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg z-10">
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

        {/* Precio base */}
        <div className="bg-green-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800 font-medium">
            Precio base por 1 {baseUnit.symbol === 'g' ? 'kg' : baseUnit.symbol}:{' '}
            <span className="text-green-600 font-bold">
              {formatCurrency(baseUnit.symbol === 'g' ? basePrice * 1000 : basePrice)}
            </span>
          </p>
        </div>

        {/* Selector de presentación */}
        <div className="grid grid-cols-2 gap-3">
          {activePresentations.map((presentation) => (
            <button
              key={presentation.id}
              onClick={() => handlePresentationSelect(presentation)}
              className="relative group/btn px-3 py-2.5 rounded-lg text-sm transition-all duration-300 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-md hover:shadow-lg hover:shadow-green-500/30 transform hover:scale-[1.02]"
            >
              <div className="font-medium">
                {formatPresentation(presentation.quantity, presentation.unit.symbol)}
              </div>
              <div className="text-sm text-green-50">
                {formatCurrency(presentation.price)}
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
