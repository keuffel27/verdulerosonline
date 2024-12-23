import React, { useState } from 'react';
import { Product, Presentation } from '../../types/store';
import { useCart } from '../../stores/cart';
import { ShoppingCart, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation>(
    product.presentations.find((p) => p.is_default) || product.presentations[0]
  );

  if (!selectedPresentation) return null;

  const handleAddToCart = () => {
    const productWithPresentation = {
      ...product,
      price: selectedPresentation.price,
      presentation: selectedPresentation
    };
    addItem(productWithPresentation);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      {/* Product Image */}
      {product.image_url && (
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}

        {/* Presentations Selector */}
        <div className="mt-3 space-y-2">
          {product.presentations.length > 1 ? (
            <select
              value={selectedPresentation.id}
              onChange={(e) => {
                const presentation = product.presentations.find(p => p.id === e.target.value);
                if (presentation) setSelectedPresentation(presentation);
              }}
              className="w-full rounded-lg border-gray-300 text-sm focus:border-green-500 focus:ring-green-500"
            >
              {product.presentations.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center justify-between text-lg font-medium text-gray-900">
              <span>{selectedPresentation.name}</span>
              <span>${selectedPresentation.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <span className="flex items-center justify-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Agregar al carrito</span>
          </span>
        </button>
      </div>
    </div>
  );
};
