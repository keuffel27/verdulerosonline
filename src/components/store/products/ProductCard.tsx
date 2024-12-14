import React from 'react';
import Image from 'next/image';
import { Product } from '../../../types/supabase';
import { useCart } from '../../../hooks/useCart';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: 1 });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer" onClick={() => onSelect?.(product)}>
      <div className="relative h-48 w-full mb-4">
        <Image
          src={product.image_url || '/placeholder.png'}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-2">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
