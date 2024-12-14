import React from 'react';
import type { Product } from '../../types/store';
import noImage from '../../assets/no-image';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const predefinedSizes = {
    gr: ['100', '250', '500', '1000'],
    kg: ['1', '2', '5', '10'],
    un: ['1', '6', '12', '24'],
  };

  const formatPrice = (basePrice: number, size: string) => {
    const baseSize = product.unit === 'gr' ? 1000 : 1;
    const multiplier = parseInt(size) / baseSize;
    return (basePrice * multiplier).toFixed(2);
  };

  const sizes = product.package_sizes && product.package_sizes.length > 0
    ? product.package_sizes
    : predefinedSizes[product.unit as keyof typeof predefinedSizes]?.slice(0, 4) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="relative aspect-square mb-4">
        <img
          src={product.image_url || noImage}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg"
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

      <div>
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <div className="text-green-600 font-bold mb-3">
          ${product.price} por {product.unit}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <span className="text-sm font-medium">
                {size} {product.unit}
              </span>
              <span className="text-green-600 font-bold">
                ${formatPrice(product.price, size)}
              </span>
            </button>
          ))}
        </div>

        {product.stock <= 0 && (
          <div className="mt-3 text-red-600 text-sm font-medium text-center">
            Sin stock disponible
          </div>
        )}
      </div>
    </div>
  );
};