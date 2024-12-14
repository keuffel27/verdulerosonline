import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type StoreAnalytics = Database['public']['Views']['store_analytics']['Row'];

export async function getStoreAnalytics(storeId: string) {
  const { data, error } = await supabase
    .from('store_analytics')
    .select('*')
    .eq('store_id', storeId)
    .single();

  if (error) throw error;
  return data;
}