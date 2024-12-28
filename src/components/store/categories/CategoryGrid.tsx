import React from 'react';
import type { Category } from '../../../types/store';
import { useNavigate } from 'react-router-dom';
import { OptimizedImage } from '../../ui/OptimizedImage';

interface Props {
  categories: Category[];
  currentCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const backgroundColors = [
  'from-green-400 to-emerald-600',
  'from-emerald-400 to-green-600',
  'from-teal-400 to-green-600',
  'from-green-400 to-teal-600',
  'from-emerald-400 to-teal-600',
  'from-green-500 to-emerald-700',
];

export const CategoryGrid: React.FC<Props> = ({
  categories,
  currentCategory,
  onCategoryChange,
}) => {
  const navigate = useNavigate();

  // Función para obtener un color de fondo aleatorio pero consistente para cada categoría
  const getCategoryBackground = (index: number) => {
    return backgroundColors[index % backgroundColors.length];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {/* Botón "Todas las categorías" */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`relative group overflow-hidden rounded-lg sm:rounded-xl aspect-[4/3] sm:aspect-square shadow-md sm:shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 ${
          !currentCategory
            ? 'ring-2 ring-green-500 ring-offset-2'
            : ''
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
        <div className="relative h-full flex flex-col items-center justify-center text-white p-4 sm:p-6">
          <span className="text-lg sm:text-xl font-bold text-center">Todas las categorías</span>
          <span className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/90">Ver todos los productos</span>
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-[-100%] rotate-45 from-transparent via-white/20 to-transparent bg-gradient-to-r animate-shine" />
        </div>
      </button>

      {/* Tarjetas de categorías */}
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`relative group overflow-hidden rounded-lg sm:rounded-xl aspect-[4/3] sm:aspect-square shadow-md sm:shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 ${
            currentCategory === category.id
              ? 'ring-2 ring-green-500 ring-offset-2'
              : ''
          }`}
        >
          {/* Fondo con imagen o gradiente */}
          {category.image_url ? (
            <div className="absolute inset-0">
              <OptimizedImage
                src={category.image_url || '/default-category.jpg'}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 group-hover:from-black/40 group-hover:to-black/70 transition-colors duration-300" />
            </div>
          ) : (
            <>
              <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryBackground(index)} transition-transform duration-500 group-hover:scale-110`} />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
            </>
          )}

          {/* Contenido de la tarjeta */}
          <div className="relative h-full flex flex-col items-center justify-center text-white p-4 sm:p-6">
            <span className="text-lg sm:text-xl font-bold text-center mb-1 sm:mb-2">{category.name}</span>
            {category.description && (
              <p className="text-xs sm:text-sm text-white/90 text-center line-clamp-2">
                {category.description}
              </p>
            )}
          </div>

          {/* Efecto de brillo en hover */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-[-100%] rotate-45 from-transparent via-white/20 to-transparent bg-gradient-to-r animate-shine" />
          </div>
        </button>
      ))}
    </div>
  );
};
