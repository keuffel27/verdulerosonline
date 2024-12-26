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

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) return;

      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .single();

        if (error) throw error;
        setStore(data);
      } catch (error) {
        console.error('Error loading store:', error);
      }
    };

    fetchStoreData();
  }, [storeId]);

  if (isLoading) return <div>Cargando productos...</div>;
  if (error) return <div>Error al cargar los productos</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {store && <StoreAddress store={store} />}

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
