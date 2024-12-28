import { supabase } from '../lib/supabase';
import { FileObject } from '@supabase/storage-js';

export interface StoreAppearance {
  store_id: string;
  logo_url: string | null;
  banner_url: string | null;
  display_name: string | null;
  products_background_url: string | null;
  store_address: string | null;
  welcome_text: string | null;
  created_at?: string;
  updated_at?: string;
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
      .maybeSingle();

    if (error) {
      console.error('Error fetching store appearance:', error);
      return {
        store_id: storeId,
        logo_url: null,
        banner_url: null,
        display_name: null,
        products_background_url: null,
        store_address: null,
        welcome_text: null,
        primary_color: '#4F46E5',
        secondary_color: '#10B981'
      };
    }
    
    return data || {
      store_id: storeId,
      logo_url: null,
      banner_url: null,
      display_name: null,
      products_background_url: null,
      store_address: null,
      welcome_text: null,
      primary_color: '#4F46E5',
      secondary_color: '#10B981'
    };
  } catch (error) {
    console.error('Error fetching store appearance:', error);
    return {
      store_id: storeId,
      logo_url: null,
      banner_url: null,
      display_name: null,
      products_background_url: null,
      store_address: null,
      welcome_text: null,
      primary_color: '#4F46E5',
      secondary_color: '#10B981'
    };
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
