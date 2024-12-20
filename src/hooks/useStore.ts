import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Store, StoreAppearance } from '../types/store';

export function useStore(storeId: string | undefined) {
  const [store, setStore] = useState<Store | null>(null);
  const [appearance, setAppearance] = useState<StoreAppearance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (storeError) throw storeError;

      // Obtener los datos de apariencia en una consulta separada
      const { data: appearanceData } = await supabase
        .from('store_appearance')
        .select('*')
        .eq('store_id', storeId)
        .single();

      setStore(storeData);
      setAppearance(appearanceData);
    } catch (err) {
      console.error('Error fetching store:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la tienda');
      setStore(null);
      setAppearance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  return { store, appearance, loading, error };
}
