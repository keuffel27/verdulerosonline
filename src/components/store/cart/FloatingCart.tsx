import React from 'react';
import { useCart } from '../../../hooks/useCart';

export const FloatingCart: React.FC = () => {
  const { items, total, toggleCart } = useCart();

  if (items.length === 0) return null;

  return (
    <button
      onClick={toggleCart}
      className="fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold">${total.toFixed(2)}</span>
        <span className="bg-white text-primary rounded-full px-2 py-1 text-sm font-bold">
          {items.length}
        </span>
      </div>
    </button>
  );
};
