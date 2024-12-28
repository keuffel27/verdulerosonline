import React from 'react';
import { useImageCache } from '../../hooks/useImageCache';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  placeholderSrc = '/placeholder.png',
  ...props 
}) => {
  const { imageUrl, loading, error } = useImageCache(src);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded" {...props}>
        <img
          src={placeholderSrc}
          alt="Cargando..."
          className="w-full h-full object-cover opacity-50"
          {...props}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 rounded p-2 text-red-500" {...props}>
        Error al cargar la imagen
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};
