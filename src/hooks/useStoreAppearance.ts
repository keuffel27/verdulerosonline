import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  StoreAppearance,
  getStoreAppearance,
  updateStoreAppearance,
  uploadStoreImage,
  deleteStoreImage,
} from '../services/appearance';

export function useStoreAppearance(storeId: string) {
  const [appearance, setAppearance] = useState<StoreAppearance | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAppearance();
  }, [storeId]);

  async function loadAppearance() {
    try {
      const data = await getStoreAppearance(storeId);
      setAppearance(data);
    } catch (error) {
      toast.error('Error al cargar la configuración de apariencia');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(file: File, type: 'logo' | 'banner') {
    if (!appearance) return;

    try {
      setSaving(true);
      // Si ya existe una imagen, eliminarla primero
      const currentUrl = type === 'logo' ? appearance.logo_url : appearance.banner_url;
      if (currentUrl) {
        await deleteStoreImage(currentUrl);
      }

      // Subir la nueva imagen
      const newUrl = await uploadStoreImage(storeId, file, type);

      // Actualizar en la base de datos
      const update = type === 'logo' 
        ? { logo_url: newUrl }
        : { banner_url: newUrl };
      
      await updateStoreAppearance(storeId, update);

      // Actualizar el estado local
      setAppearance({ ...appearance, ...update });
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} actualizado correctamente`);
    } catch (error) {
      toast.error(`Error al subir el ${type === 'logo' ? 'logo' : 'banner'}`);
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function handleColorUpdate(colors: { primary?: string; secondary?: string }) {
    if (!appearance) return;

    try {
      setSaving(true);
      await updateStoreAppearance(storeId, {
        primary_color: colors.primary || appearance.primary_color,
        secondary_color: colors.secondary || appearance.secondary_color,
      });

      setAppearance({
        ...appearance,
        primary_color: colors.primary || appearance.primary_color,
        secondary_color: colors.secondary || appearance.secondary_color,
      });

      toast.success('Colores actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los colores');
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  return {
    appearance,
    loading,
    saving,
    handleImageUpload,
    handleColorUpdate,
  };
}
