import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStoreAppearance } from '../../../hooks/useStoreAppearance';
import { useStore } from '../../../hooks/useStore';
import { Spinner } from '../../../components/ui/Spinner';
import { ImageUploader } from '../../../components/store/ImageUploader';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../services/supabase';
import { motion } from 'framer-motion';

export default function StoreAppearance() {
  const { storeId } = useParams<{ storeId: string }>();
  const { store } = useStore(storeId);
  const {
    appearance,
    loading,
    saving,
    error,
    setAppearance,
    loadAppearance
  } = useStoreAppearance(storeId || '');

  // Estado local para los cambios pendientes
  const [pendingChanges, setPendingChanges] = useState({
    display_name: '',
    welcome_text: '',
  });

  // Inicializar los valores pendientes cuando se carga appearance
  useEffect(() => {
    if (appearance) {
      setPendingChanges({
        display_name: appearance.display_name || '',
        welcome_text: appearance.welcome_text || '',
      });
    }
  }, [appearance]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleImageUpdate = async (type: 'logo' | 'banner' | 'products_background', newImageUrl: string) => {
    try {
      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('store_appearance')
        .upsert({
          store_id: storeId,
          [`${type}_url`]: newImageUrl,
        });

      if (updateError) throw updateError;

      // Actualizar el estado local
      setAppearance(prev => ({
        ...prev,
        [`${type}_url`]: newImageUrl
      }));

      toast.success(`Imagen actualizada correctamente`);
      await loadAppearance();
    } catch (err) {
      console.error('Error al actualizar imagen:', err);
      toast.error('Error al actualizar la imagen');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const { error: updateError } = await supabase
        .from('store_appearance')
        .upsert({
          store_id: storeId,
          display_name: pendingChanges.display_name,
          welcome_text: pendingChanges.welcome_text,
        });

      if (updateError) throw updateError;

      // Actualizar el estado local
      setAppearance(prev => ({
        ...prev,
        display_name: pendingChanges.display_name,
        welcome_text: pendingChanges.welcome_text,
      }));

      await loadAppearance();
      toast.success('Cambios guardados correctamente');
    } catch (err) {
      console.error('Error al guardar:', err);
      toast.error('Error al guardar los cambios');
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!appearance) return false;
    return pendingChanges.display_name !== (appearance.display_name || '') ||
           pendingChanges.welcome_text !== (appearance.welcome_text || '');
  }, [pendingChanges, appearance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', opacity: 0.5 }}></div>
          </div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Apariencia de la Tienda
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Personaliza cómo se ve tu tienda para tus clientes.
          </p>
        </div>
        {hasUnsavedChanges && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveChanges}
            className="inline-flex items-center px-4 py-2 rounded-xl shadow-lg text-sm font-medium text-white
                     bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            Guardar Cambios
          </motion.button>
        )}
      </motion.div>

      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Columna Izquierda: Textos */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 w-1 h-6 rounded mr-2"></span>
                Textos
              </h3>
              
              {/* Título Principal */}
              <div className="space-y-2">
                <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                  Título Principal
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  <input
                    type="text"
                    id="display_name"
                    className="relative bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full 
                             sm:text-sm border-gray-200 rounded-lg transition-all duration-200 group-hover:border-green-300"
                    placeholder={store?.name || 'Nombre de la tienda'}
                    value={pendingChanges.display_name}
                    onChange={(e) => setPendingChanges(prev => ({ ...prev, display_name: e.target.value }))}
                  />
                </div>
              </div>

              {/* Mensaje de Bienvenida */}
              <div className="space-y-2 mt-6">
                <label htmlFor="welcome_text" className="block text-sm font-medium text-gray-700">
                  Mensaje de Bienvenida
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  <textarea
                    id="welcome_text"
                    rows={4}
                    className="relative bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full 
                             sm:text-sm border-gray-200 rounded-lg transition-all duration-200 group-hover:border-green-300"
                    placeholder="Escribe un mensaje de bienvenida para tus clientes..."
                    value={pendingChanges.welcome_text}
                    onChange={(e) => setPendingChanges(prev => ({ ...prev, welcome_text: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Imágenes */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 w-1 h-6 rounded mr-2"></span>
                Imágenes
              </h3>

              {/* Logo */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <ImageUploader
                    currentImageUrl={appearance?.logo_url}
                    onImageUpdate={(url) => handleImageUpdate('logo', url)}
                    className="rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 
                              transition-colors duration-200 bg-gray-50 hover:bg-green-50"
                  />
                </div>

                {/* Banner */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner</label>
                  <ImageUploader
                    currentImageUrl={appearance?.banner_url}
                    onImageUpdate={(url) => handleImageUpdate('banner', url)}
                    className="rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 
                              transition-colors duration-200 bg-gray-50 hover:bg-green-50"
                  />
                </div>

                {/* Fondo de Productos */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fondo de Productos</label>
                  <ImageUploader
                    currentImageUrl={appearance?.products_background_url}
                    onImageUpdate={(url) => handleImageUpdate('products_background', url)}
                    className="rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 
                              transition-colors duration-200 bg-gray-50 hover:bg-green-50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
