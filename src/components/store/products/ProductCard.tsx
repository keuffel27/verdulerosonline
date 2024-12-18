import React, { useState } from 'react';
import { formatCurrency } from '../../../utils/format';
import type { Database } from '../../../lib/database.types';
import noImage from '../../../assets/no-image';
import { ProductQuantitySelector } from './ProductQuantitySelector';

type ProductPresentation = Database['public']['Tables']['product_presentations']['Row'] & {
  unit: Database['public']['Tables']['measurement_units']['Row']
};

type Product = Database['public']['Tables']['store_products']['Row'] & {
  presentations: ProductPresentation[];
  category?: Database['public']['Tables']['store_categories']['Row'];
};

interface Props {
  product: Product;
  onAddToCart: (presentationId: string, quantity: number) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const [selectedPresentation, setSelectedPresentation] = useState<ProductPresentation>(
    product.presentations.find(p => p.is_default) || product.presentations[0]
  );
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (selectedPresentation) {
      onAddToCart(selectedPresentation.id, quantity);
      setQuantity(1); // Reset quantity after adding to cart
    }
  };

  if (!selectedPresentation) return null;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Imagen y categoría */}
      <div className="relative aspect-square">
        <img
          src={product.image_url || noImage}
          alt={product.name}
          className="w-full h-full object-cover rounded-t-lg"
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
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Presentaciones */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {product.presentations.map((presentation) => (
            <button
              key={presentation.id}
              onClick={() => setSelectedPresentation(presentation)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${
                selectedPresentation.id === presentation.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
              }`}
              disabled={presentation.stock <= 0}
            >
              <span className="text-sm font-medium">
                {presentation.quantity} {presentation.unit.symbol}
              </span>
              <span className="text-green-600 font-bold">
                {formatCurrency(presentation.price)}
              </span>
              {presentation.stock <= 0 && (
                <span className="text-red-500 text-xs">Sin stock</span>
              )}
            </button>
          ))}
        </div>

        {/* Selector de cantidad y botón de agregar */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <ProductQuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            max={selectedPresentation.stock}
            disabled={selectedPresentation.stock <= 0}
          />
          
          <button
            onClick={handleAddToCart}
            disabled={selectedPresentation.stock <= 0}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              selectedPresentation.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {selectedPresentation.stock <= 0 ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};
