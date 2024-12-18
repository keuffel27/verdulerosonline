import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['store_categories']['Row'];

export const useCategories = (storeId: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('store_categories')
          .select('*')
          .eq('store_id', storeId)
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Subscribe to changes
    const subscription = supabase
      .channel('store_categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_categories',
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [storeId]);

  return { categories, loading, error };
};
