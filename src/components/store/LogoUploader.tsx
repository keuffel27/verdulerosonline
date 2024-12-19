import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { uploadImage, deleteImage } from '../../services/imageUpload';
import { toast } from 'react-hot-toast';
import { Store, Upload } from 'lucide-react';

interface LogoUploaderProps {
  storeId: string;
  currentLogoUrl?: string;
  onLogoUpdate: (newLogoUrl: string) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  storeId,
  currentLogoUrl,
  onLogoUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null);

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validaciones
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecciona una imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

      setUploading(true);

      // 1. Subir la imagen a ImgBB
      const { url: newLogoUrl } = await uploadImage(file);

      // 2. Actualizar la URL en la base de datos
      const { error: updateError } = await supabase
        .from('store_appearance')
        .upsert({
          store_id: storeId,
          logo_url: newLogoUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // 3. Actualizar el estado local
      setLogoUrl(newLogoUrl);
      onLogoUpdate(newLogoUrl);
      
      toast.success('Logo actualizado con éxito');

    } catch (error) {
      console.error('Error al subir el logo:', error);
      toast.error('Error al actualizar el logo');
      setLogoUrl(currentLogoUrl || null);
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Preview del logo */}
      <div className="relative w-32 h-32 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-gray-200">
        {logoUrl ? (
          <img
            key={logoUrl}
            src={logoUrl}
            alt="Logo de la tienda"
            className="w-full h-full object-contain"
            onError={() => setLogoUrl(null)}
          />
        ) : (
          <Store className="w-12 h-12 text-gray-400" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Botón de carga */}
      <label className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleLogoChange}
          disabled={uploading}
        />
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Subiendo...' : 'Cambiar Logo'}
      </label>

      <p className="text-sm text-gray-500 text-center">
        Formatos: PNG, JPG, WebP
        <br />
        Tamaño máximo: 5MB
      </p>
    </div>
  );
};
