import { useState, useEffect } from 'react';

interface ImageCache {
  [key: string]: string;
}

const cache: ImageCache = {};

export const useImageCache = (url: string) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Si la imagen ya está en caché, úsala
        if (cache[url]) {
          setImageUrl(cache[url]);
          setLoading(false);
          return;
        }

        // Cargar y cachear la imagen
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        // Guardar en caché
        cache[url] = objectUrl;
        
        setImageUrl(objectUrl);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    loadImage();

    // Limpieza al desmontar
    return () => {
      if (cache[url]) {
        URL.revokeObjectURL(cache[url]);
        delete cache[url];
      }
    };
  }, [url]);

  return { imageUrl, loading, error };
};
