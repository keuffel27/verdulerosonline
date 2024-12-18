import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';

export const Navigation: React.FC = () => {
  const items = useCartStore((state) => state.items);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/src/assets/images/logo/verdulogo.webp" 
              alt="Verduleros Online Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="font-bold text-xl">Verduleros Online</span>
          </Link>
          <Link
            to="/cart"
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
          >
            <ShoppingCart className="w-6 h-6" />
            {items.length > 0 && (
              <span className="bg-green-600 text-white text-sm rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};