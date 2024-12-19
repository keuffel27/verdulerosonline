import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { StoreAppearance } from '../types/store';
import { supabase } from '../services/supabase';

export function useStoreAppearance(storeId: string) {
  const [appearance, setAppearance] = useState<StoreAppearance | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar useCallback para la función loadAppearance
  const loadAppearance = useCallback(async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('store_appearance')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setAppearance(data);
    } catch (err) {
      console.error('Error loading appearance:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la configuración');
      toast.error('Error al cargar la configuración de la tienda');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Cargar datos iniciales
  useEffect(() => {
    loadAppearance();
  }, [loadAppearance]);

  // Función para guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appearance) return;

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('store_appearance')
        .upsert({
          ...appearance,
          store_id: storeId,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;
      
      toast.success('Cambios guardados con éxito');
      await loadAppearance(); // Recargar datos después de guardar
    } catch (err) {
      console.error('Error saving appearance:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios');
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return {
    appearance,
    loading,
    saving,
    error,
    handleSubmit,
    setAppearance,
    loadAppearance // Asegurarnos de exportar loadAppearance
  };
}
