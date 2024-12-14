import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Image, Upload, Loader } from 'lucide-react';
import { ChromePicker, ColorResult } from 'react-color';
import { useStoreAppearance } from '../../../hooks/useStoreAppearance';
import { toast } from 'react-toastify';

const StoreAppearance: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<'primary' | 'secondary'>('primary');

  const {
    appearance,
    loading,
    saving,
    handleImageUpload,
    handleColorUpdate,
  } = useStoreAppearance(storeId ?? '');

  const handleFileChange = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen');
      return;
    }

    await handleImageUpload(file, type);
  }, [handleImageUpload]);

  const handleColorChange = useCallback((color: ColorResult) => {
    handleColorUpdate({
      [selectedColor === 'primary' ? 'primary_color' : 'secondary_color']: color.hex,
    });
  }, [selectedColor, handleColorUpdate]);

  if (!storeId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Apariencia de la Tienda
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Personaliza el aspecto visual de tu tienda para que coincida con tu marca.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {appearance?.logo_url ? (
                      <img
                        src={appearance.logo_url}
                        alt="Logo"
                        className="mx-auto h-24 w-24 object-contain"
                      />
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="logo-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Subir un archivo</span>
                        <input
                          id="logo-upload"
                          name="logo-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'logo')}
                          disabled={saving}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                  </div>
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Banner Principal
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {appearance?.banner_url ? (
                      <img
                        src={appearance.banner_url}
                        alt="Banner"
                        className="mx-auto h-32 w-full object-cover rounded"
                      />
                    ) : (
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="banner-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Subir un archivo</span>
                        <input
                          id="banner-upload"
                          name="banner-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'banner')}
                          disabled={saving}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG hasta 10MB (Recomendado: 1920x400px)
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Esquema de Colores
                </label>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">
                      Color Principal
                    </label>
                    <div
                      className="w-full h-10 rounded cursor-pointer border"
                      style={{ backgroundColor: appearance?.primary_color }}
                      onClick={() => {
                        setSelectedColor('primary');
                        setShowColorPicker(true);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">
                      Color Secundario
                    </label>
                    <div
                      className="w-full h-10 rounded cursor-pointer border"
                      style={{ backgroundColor: appearance?.secondary_color }}
                      onClick={() => {
                        setSelectedColor('secondary');
                        setShowColorPicker(true);
                      }}
                    />
                  </div>
                </div>
                {showColorPicker && (
                  <div className="absolute z-10 mt-2">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowColorPicker(false)}
                    />
                    <ChromePicker
                      color={
                        selectedColor === 'primary'
                          ? appearance?.primary_color
                          : appearance?.secondary_color
                      }
                      onChange={handleColorChange}
                    />
                  </div>
                )}
              </div>

              {saving && (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin text-green-600 mr-2" />
                  <span className="text-sm text-gray-500">Guardando cambios...</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreAppearance;
