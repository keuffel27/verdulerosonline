import React from 'react';
import type { Product } from '../../types/store';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

interface AddToCartButtonProps {
  product: Product;
  presentation: Product['presentations'][0];
  disabled?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  presentation,
  disabled = false,
}) => {
  const { addItem } = useCart();

  const handleClick = () => {
    addItem({
      product,
      presentation,
      quantity: 1,
    });
    toast.success(`Agregado: ${presentation.quantity} ${presentation.unit.symbol} de ${product.name}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
        disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      Agregar al carrito
    </button>
  );
};
