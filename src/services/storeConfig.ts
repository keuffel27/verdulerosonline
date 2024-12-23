import { supabase } from './supabase';

interface StoreConfig {
  whatsapp_number: string;
  store_name: string;
  // Otros campos de configuración que puedas necesitar
}

export const getStoreConfig = async (storeId: string): Promise<StoreConfig | null> => {
  const { data, error } = await supabase
    .from('store_config')
    .select('*')
    .eq('store_id', storeId)
    .single();

  if (error) {
    console.error('Error al obtener la configuración de la tienda:', error);
    return null;
  }

  return data;
};

export const updateStoreConfig = async (
  storeId: string,
  config: Partial<StoreConfig>
): Promise<boolean> => {
  const { error } = await supabase
    .from('store_config')
    .update(config)
    .eq('store_id', storeId);

  if (error) {
    console.error('Error al actualizar la configuración de la tienda:', error);
    return false;
  }

  return true;
};

export const getStoreWhatsapp = async (storeId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('stores')
    .select('whatsapp')
    .eq('id', storeId)
    .single();

  if (error) {
    console.error('Error al obtener el número de WhatsApp de la tienda:', error);
    return null;
  }

  return data?.whatsapp || null;
};
