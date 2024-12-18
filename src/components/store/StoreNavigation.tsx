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
    <div className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-green-100/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 space-y-4 md:space-y-0">
          {/* Barra de búsqueda */}
          <div className="w-full md:w-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-green-500 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-green-600/5 rounded-full blur group-hover:blur-md transition-all duration-300"></div>
            <input
              type="search"
              placeholder="Buscar productos..."
              className="w-full md:w-80 pl-12 pr-4 py-3 rounded-full text-sm bg-white/50 border border-green-100/30 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-300 placeholder-gray-400 relative z-10"
            />
          </div>

          {/* Título de la categoría actual */}
          {currentCategory && (
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:block">
              <div className="relative group">
                {/* Efecto de fondo con blur */}
                <div className="absolute -inset-3 bg-gradient-to-r from-green-400/20 via-emerald-500/20 to-green-600/20 rounded-lg blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                
                {/* Título con gradiente */}
                <h2 className="relative text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-emerald-500 to-green-400 px-8 py-3 tracking-wide transition-all duration-300 transform group-hover:scale-105">
                  {categories.find(cat => cat.id === currentCategory)?.name || 'Todas las categorías'}
                </h2>
                
                {/* Línea decorativa inferior */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 animate-shimmer"></div>
                </div>
                
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-[-100%] rotate-45 from-transparent via-white/20 to-transparent bg-gradient-to-r animate-shine"></div>
                </div>
              </div>
            </div>
          )}

          {/* Categorías */}
          <div className="w-full md:w-auto flex items-center space-x-3 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 relative group whitespace-nowrap ${
                !currentCategory
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:shadow-green-500/50'
                  : 'hover:bg-white/50 text-gray-600 hover:text-green-600 border border-green-100/30'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-600/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
              <span className="relative z-10">Todas las categorías</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 relative group whitespace-nowrap ${
                  currentCategory === category.id
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:shadow-green-500/50'
                    : 'hover:bg-white/50 text-gray-600 hover:text-green-600 border border-green-100/30'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-600/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                <span className="relative z-10">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
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
