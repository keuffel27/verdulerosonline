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

  const handleAddToCart = () => {
    if (!selectedPresentation) {
      toast.error('Por favor selecciona una presentación');
      return;
    }

    if (quantity > selectedPresentation.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }
    
    onAddToCart(selectedPresentation.id, quantity);
    setQuantity(1); // Reset quantity after adding to cart
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Imagen del producto */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.image_url || noImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.category && (
          <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        )}

        {/* Precio base */}
        <p className="text-gray-500 text-sm mb-3">
          Precio base: {formatCurrency(basePrice)}/{baseUnit.symbol}
        </p>

        {/* Selector de presentación */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {activePresentations.map((presentation) => (
            <button
              key={presentation.id}
              onClick={() => setSelectedPresentation(presentation)}
              className={`px-2 py-1 rounded text-sm ${
                selectedPresentation?.id === presentation.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {presentation.quantity} {presentation.unit.symbol}
              <br />
              {formatCurrency(presentation.price)}
            </button>
          ))}
        </div>

        {/* Control de cantidad */}
        {selectedPresentation && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedPresentation.stock, quantity + 1))}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-gray-600">
              Stock: {selectedPresentation.stock}
            </span>
          </div>
        )}

        {/* Botón de agregar al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedPresentation}
          className={`w-full py-2 px-4 rounded-lg ${
            selectedPresentation
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedPresentation
            ? `Agregar - ${formatCurrency(selectedPresentation.price * quantity)}`
            : 'Selecciona una presentación'}
        </button>
      </div>
    </div>
  );
};
