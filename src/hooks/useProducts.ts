import { useState, useEffect } from 'react';
import { getProductsByStore } from '../services/products';
import { Product } from '../types/store';

export const useProducts = (storeId: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) {
        setError('No se especificó una tienda');
        setIsLoading(false);
        return;
      }

      try {
        const data = await getProductsByStore(storeId);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los productos');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [storeId]);

  return { products, isLoading, error };
};
