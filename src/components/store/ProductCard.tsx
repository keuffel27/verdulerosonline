import React from 'react';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';
import noImage from '../../assets/no-image';
import type { Product } from '../../types/store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (presentation: Product['presentations'][0], quantity: number) => {
    addItem({
      product,
      presentation,
      quantity
    });
    toast.success(`Agregado: ${quantity} ${presentation.unit.symbol} de ${product.name}`);
  };

  if (!product.presentations?.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Imagen y categoría */}
      <div className="relative aspect-square">
        <img
          src={product.image_url || noImage}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = noImage;
          }}
        />
        {product.category && (
          <span className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        )}

        {/* Presentaciones */}
        <div className="space-y-3">
          {product.presentations.map((presentation) => (
            <div
              key={presentation.id}
              className="border rounded-lg p-3 bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {presentation.quantity} {presentation.unit.symbol}
                </span>
                <span className="text-lg font-bold text-green-600">
                  S/ {presentation.price.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {presentation.unit.symbol === 'kg' && (
                  <>
                    <button
                      onClick={() => handleAddToCart(presentation, 0.1)}
                      className="flex-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-full transition-colors"
                    >
                      +100g
                    </button>
                    <button
                      onClick={() => handleAddToCart(presentation, 0.25)}
                      className="flex-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-full transition-colors"
                    >
                      +250g
                    </button>
                    <button
                      onClick={() => handleAddToCart(presentation, 0.5)}
                      className="flex-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-full transition-colors"
                    >
                      +500g
                    </button>
                    <button
                      onClick={() => handleAddToCart(presentation, 1)}
                      className="flex-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-full transition-colors"
                    >
                      +1kg
                    </button>
                  </>
                )}
                {presentation.unit.symbol === 'unit' && (
                  <>
                    <button
                      onClick={() => handleAddToCart(presentation, 1)}
                      className="flex-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-full transition-colors"
                    >
                      +1 unidad
                    </button>
                    <button
                      onClick={() => handleAddToCart(presentation, 6)}
                      className="flex-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-full transition-colors"
                    >
                      +6 unidades
                    </button>
                    <button
                      onClick={() => handleAddToCart(presentation, 12)}
                      className="flex-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-full transition-colors"
                    >
                      +12 unidades
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};