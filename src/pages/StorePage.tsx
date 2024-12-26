import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/store/ProductCard';
import FloatingCart from '../components/store/FloatingCart';
import CartDrawer from '../components/store/CartDrawer';
import { StoreAddress } from '../components/store/StoreAddress';
import { useProducts } from '../hooks/useProducts';
import { supabase } from '../lib/supabase';
import type { Store } from '../types/store';

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { products, isLoading, error } = useProducts(storeId);
  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) {
        console.error('No storeId provided');
        setStoreError('ID de tienda no proporcionado');
        setStoreLoading(false);
        return;
      }

      console.log('Fetching store data for ID:', storeId);
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .single();

        if (error) {
          console.error('Error fetching store:', error);
          setStoreError(error.message);
          throw error;
        }

        console.log('Store data received:', data);
        setStore(data);
      } catch (error) {
        console.error('Error loading store:', error);
        setStoreError('Error al cargar la tienda');
      } finally {
        setStoreLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  if (storeLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (storeError || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>{storeError || 'Error al cargar los productos'}</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>No se encontró la tienda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <StoreAddress store={store} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <FloatingCart storeId={storeId || ''} />
      <CartDrawer />
    </div>
  );
};

export default StorePage;
