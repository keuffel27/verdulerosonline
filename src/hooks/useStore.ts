import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Store } from '../types/store';

export function useStore(storeId: string | undefined) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select(`
          *,
          store_appearance (
            logo_url,
            banner_url,
            store_address,
            welcome_text,
            primary_color,
            secondary_color
          )
        `)
        .eq('id', storeId)
        .single();

      if (storeError) throw storeError;

      // Asegurarse de que los datos de apariencia estén disponibles
      const { data: appearanceData, error: appearanceError } = await supabase
        .from('store_appearance')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (appearanceError && appearanceError.code !== 'PGRST116') {
        throw appearanceError;
      }

      setStore({
        ...storeData,
        store_appearance: appearanceData || storeData.store_appearance
      });
    } catch (err) {
      console.error('Error fetching store:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  const refetchStore = async () => {
    await fetchStore();
  };

  return {
    store,
    loading,
    error,
    refetchStore
  };
}
