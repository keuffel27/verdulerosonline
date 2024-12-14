import { supabase } from '../lib/supabase';
import { FileObject } from '@supabase/storage-js';

export interface StoreAppearance {
  store_id: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  secondary_color: string;
}

export async function uploadStoreImage(
  storeId: string,
  file: File,
  type: 'logo' | 'banner'
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${storeId}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('store-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('store-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function getStoreAppearance(storeId: string): Promise<StoreAppearance | null> {
  try {
    const { data, error } = await supabase
      .from('store_appearance')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching store appearance:', error);
    return null;
  }
}

export async function updateStoreAppearance(
  storeId: string,
  appearance: Partial<StoreAppearance>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('store_appearance')
      .upsert({
        store_id: storeId,
        ...appearance,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating store appearance:', error);
    throw error;
  }
}

export async function deleteStoreImage(url: string): Promise<void> {
  try {
    const path = url.split('/').pop();
    if (!path) throw new Error('Invalid URL');

    const { error } = await supabase.storage
      .from('store-images')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting store image:', error);
    throw error;
  }
}
