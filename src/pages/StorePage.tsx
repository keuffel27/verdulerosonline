import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/store/ProductCard';
import FloatingCart from '../components/store/FloatingCart';
import CartDrawer from '../components/store/CartDrawer';
import { StoreAddress } from '../components/store/StoreAddress';
import { useProducts } from '../hooks/useProducts';
import { supabase } from '../lib/supabase';
import { isStoreOpen } from '../services/schedule';
import type { WeekSchedule, Store } from '../types/store';

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { products, isLoading, error } = useProducts(storeId);
  const [storeSchedule, setStoreSchedule] = useState<WeekSchedule | null>(null);
  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean; nextChange: string }>({ isOpen: false, nextChange: '' });
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

  useEffect(() => {
    const fetchStoreSchedule = async () => {
      if (!storeId) return;

      try {
        const { data, error } = await supabase
          .from('store_schedule')
          .select('schedule')
          .eq('store_id', storeId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No schedule found, using default');
            const defaultSchedule = {
              monday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              tuesday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              wednesday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              thursday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              friday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              saturday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              sunday: {
                isOpen: false,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
            };
            setStoreSchedule(defaultSchedule);
          } else {
            console.error('Error fetching schedule:', error);
          }
        } else if (data) {
          setStoreSchedule(data.schedule);
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };

    fetchStoreSchedule();
  }, [storeId]);

  useEffect(() => {
    if (!storeSchedule) return;

    // Actualizar el estado inicial
    const status = isStoreOpen(storeSchedule);
    setStoreStatus(status);

    // Actualizar cada minuto
    const interval = setInterval(() => {
      const status = isStoreOpen(storeSchedule);
      setStoreStatus(status);
    }, 60000);

    return () => clearInterval(interval);
  }, [storeSchedule]);

  if (isLoading) return <div>Cargando productos...</div>;
  if (error) return <div>Error al cargar los productos</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {store && <StoreAddress store={store} isOpen={storeStatus.isOpen} />}

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
