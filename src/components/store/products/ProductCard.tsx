import React, { useState } from 'react';
import { formatCurrency } from '../../../utils/format';
import type { Database } from '../../../lib/database.types';
import noImage from '../../../assets/no-image';

type Product = Database['public']['Tables']['store_products']['Row'];

interface Props {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Imagen del producto */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
        <img
          src={product.image_url || noImage}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-medium text-gray-900">
            {formatCurrency(product.price)}
            <span className="text-sm text-gray-500">
              /{product.unit_type}
            </span>
          </p>
        </div>

        {/* Controles de cantidad y botón de agregar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              className="p-2 text-gray-600 hover:text-gray-700"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-12 text-center border-x border-gray-300 p-1"
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              className="p-2 text-gray-600 hover:text-gray-700"
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => onAddToCart(quantity)}
            className="flex-shrink-0 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};
