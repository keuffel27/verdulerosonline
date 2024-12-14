import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Category } from '../../types/store';
import { Search } from 'lucide-react';

interface StoreNavigationProps {
  storeId: string;
  categories: Category[];
}

export const StoreNavigation: React.FC<StoreNavigationProps> = ({
  storeId,
  categories,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryChange = (categoryId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (categoryId) {
      newSearchParams.set('category', categoryId);
    } else {
      newSearchParams.delete('category');
    }
    navigate(`/store/${storeId}?${newSearchParams.toString()}`);
  };

  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !currentCategory
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    currentCategory === category.id
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Buscar productos..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
