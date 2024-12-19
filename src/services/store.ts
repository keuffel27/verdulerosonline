import { supabase } from './supabase';
import type { StoreAppearance } from '../types/store';

export async function getStoreAppearance(storeId: string): Promise<StoreAppearance | null> {
  console.log('Fetching store appearance for storeId:', storeId);
  
  try {
    let { data, error } = await supabase
      .from('store_appearance')
      .select('*')
      .eq('store_id', storeId)
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching store appearance:', error);
      throw new Error(`Error al obtener la apariencia de la tienda: ${error.message}`);
    }

    if (!data) {
      console.log('No appearance found, creating default');
      const defaultAppearance = {
        store_id: storeId,
        welcome_text: '¡Bienvenidos a mi tienda!',
        store_address: '',
        logo_url: '',
        banner_url: ''
      };

      const { data: newData, error: upsertError } = await supabase
        .from('store_appearance')
        .upsert(defaultAppearance)
        .select()
        .single();

      if (upsertError) {
        console.error('Error creating store appearance:', upsertError);
        throw new Error(`Error al crear la apariencia de la tienda: ${upsertError.message}`);
      }

      return newData;
    }

    console.log('Store appearance data:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error fetching store appearance:', error);
    throw error;
  }
}

export async function updateStoreAppearance(
  storeId: string,
  updates: Partial<StoreAppearance>
): Promise<void> {
  console.log('Updating store appearance for storeId:', storeId, 'with updates:', updates);
  
  try {
    const { error } = await supabase
      .from('store_appearance')
      .upsert({
        store_id: storeId,
        ...updates,
      });

    if (error) {
      console.error('Supabase error updating store appearance:', error);
      throw new Error(`Error al actualizar la apariencia de la tienda: ${error.message}`);
    }

    console.log('Store appearance updated successfully');
  } catch (error) {
    console.error('Unexpected error updating store appearance:', error);
    throw error;
  }
}

export async function uploadStoreImage(
  storeId: string,
  file: File,
  type: 'logo' | 'banner'
): Promise<string> {
  try {
    // 1. Validaciones básicas
    if (!file) throw new Error('No se proporcionó ningún archivo');
    if (file.size > 5 * 1024 * 1024) throw new Error('El archivo es demasiado grande (máximo 5MB)');
    
    // 2. Validar tipo de archivo
    if (!file.type.startsWith('image/')) throw new Error('El archivo debe ser una imagen');
    
    // 3. Generar nombre de archivo único
    const timestamp = Date.now();
    const fileExt = file.type.split('/')[1];
    const fileName = `${storeId}-${timestamp}.${fileExt}`;
    const bucketName = `store-${type}s`;

    // 4. Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;
    if (!uploadData?.path) throw new Error('Error al obtener la ruta del archivo');

    // 5. Obtener URL pública
    const { data: { publicUrl }, error: urlError } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);

    if (urlError) throw urlError;
    if (!publicUrl) throw new Error('Error al obtener la URL pública');

    // 6. Actualizar la base de datos con la nueva URL
    const { error: dbError } = await supabase
      .from('store_appearance')
      .upsert({
        store_id: storeId,
        [`${type}_url`]: publicUrl,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'store_id'
      });

    if (dbError) throw dbError;

    // 7. Verificar que la imagen sea accesible
    const response = await fetch(publicUrl, { method: 'HEAD' });
    if (!response.ok) throw new Error('La imagen subida no es accesible');

    return publicUrl;
  } catch (error) {
    console.error('Error en uploadStoreImage:', error);
    throw error;
  }
}

export async function deleteStoreImage(url: string): Promise<void> {
  console.log('Deleting store image:', url);
  
  try {
    // Extraer el bucket y path del archivo de la URL
    const urlParts = url.split('/');
    const bucket = urlParts.includes('store-logos') ? 'store-logos' : 'store-banners';
    const path = urlParts.slice(-2).join('/');

    console.log('Deleting file from bucket:', { bucket, path });

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Supabase error deleting image:', error);
      throw new Error(`Error al eliminar la imagen: ${error.message}`);
    }

    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Unexpected error deleting image:', error);
    throw error;
  }
}
