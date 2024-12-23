import React from 'react';
import { Product, Presentation } from '../../types/store';
import { useCart } from '../../stores/cart';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const defaultPresentation = product.presentations.find((p) => p.is_default) || product.presentations[0];

  if (!defaultPresentation) return null;

  const handleAddToCart = () => {
    console.log('Selected presentation:', defaultPresentation);
    console.log('Product:', product);
    
    // Crear una copia del producto con la presentación seleccionada
    const productWithPresentation = {
      ...product,
      price: defaultPresentation.price,
      presentation: defaultPresentation
    };

    console.log('Adding to cart:', productWithPresentation);
    addItem(productWithPresentation);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      {product.image_url && (
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-medium">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-gray-500">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-lg font-medium">
              ${defaultPresentation.price.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="ml-1 text-sm text-gray-500">
              / {defaultPresentation.quantity} {defaultPresentation.unit.symbol}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};
