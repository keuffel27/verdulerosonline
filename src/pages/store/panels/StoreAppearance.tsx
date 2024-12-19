import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStoreAppearance } from '../../../hooks/useStoreAppearance';
import { useStore } from '../../../hooks/useStore';
import { Spinner } from '../../../components/ui/Spinner';
import { ImageUploader } from '../../../components/store/ImageUploader';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../services/supabase';

export default function StoreAppearance() {
  const { storeId } = useParams<{ storeId: string }>();
  const { store, refetchStore } = useStore(storeId);
  const {
    appearance,
    loading,
    saving,
    error,
    setAppearance,
    loadAppearance
  } = useStoreAppearance(storeId || '');

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleImageUpdate = async (type: 'logo' | 'banner', newImageUrl: string) => {
    try {
      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('store_appearance')
        .upsert({
          store_id: storeId,
          [`${type}_url`]: newImageUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // Actualizar estado local
      setAppearance(prev => prev ? {
        ...prev,
        [`${type}_url`]: newImageUrl
      } : null);

      // Recargar datos
      await Promise.all([
        refetchStore(),
        loadAppearance()
      ]);

    } catch (err) {
      console.error('Error actualizando imagen:', err);
      toast.error('Error al guardar los cambios');
    }
  };

  if (!storeId) {
    return <div>ID de tienda no válido</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold mb-6">Apariencia de la Tienda</h2>

      {/* Sección de Imágenes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Logo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Logo de la Tienda</h3>
          <ImageUploader
            type="logo"
            storeId={storeId}
            currentImageUrl={appearance?.logo_url}
            onImageUpdate={(newUrl) => handleImageUpdate('logo', newUrl)}
          />
        </div>

        {/* Banner */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Banner de la Tienda</h3>
          <ImageUploader
            type="banner"
            storeId={storeId}
            currentImageUrl={appearance?.banner_url}
            onImageUpdate={(newUrl) => handleImageUpdate('banner', newUrl)}
          />
        </div>
      </div>

      {/* Otros campos del formulario */}
      <div className="space-y-6">
        <div>
          <label htmlFor="store_address" className="block text-sm font-medium text-gray-700">
            Dirección de la Tienda
          </label>
          <input
            type="text"
            id="store_address"
            value={appearance?.store_address || ''}
            onChange={(e) => setAppearance(prev => prev ? {
              ...prev,
              store_address: e.target.value
            } : null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="welcome_text" className="block text-sm font-medium text-gray-700">
            Mensaje de Bienvenida
          </label>
          <textarea
            id="welcome_text"
            rows={3}
            value={appearance?.welcome_text || ''}
            onChange={(e) => setAppearance(prev => prev ? {
              ...prev,
              welcome_text: e.target.value
            } : null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-4">
        <button
          onClick={async () => {
            try {
              const { error: updateError } = await supabase
                .from('store_appearance')
                .upsert({
                  ...appearance,
                  store_id: storeId,
                  updated_at: new Date().toISOString()
                });

              if (updateError) throw updateError;
              
              toast.success('Cambios guardados con éxito');
              await loadAppearance();
            } catch (err) {
              console.error('Error guardando cambios:', err);
              toast.error('Error al guardar los cambios');
            }
          }}
          disabled={saving}
          className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
            saving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
