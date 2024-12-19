import React, { useState } from 'react';
import { uploadImage } from '../../services/imageUpload';
import { toast } from 'react-hot-toast';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  type: 'logo' | 'banner';
  storeId: string;
  currentImageUrl?: string;
  onImageUpdate: (newImageUrl: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  type,
  storeId,
  currentImageUrl,
  onImageUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);

  const isLogo = type === 'logo';
  const containerClass = isLogo 
    ? "w-32 h-32" 
    : "w-full h-48";

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      // Subir la imagen a ImgBB
      const { url: newImageUrl } = await uploadImage(file);
      
      // Actualizar estado local
      setImageUrl(newImageUrl);
      onImageUpdate(newImageUrl);
      
      toast.success(`${isLogo ? 'Logo' : 'Banner'} actualizado con éxito`);

    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error(`Error al actualizar el ${isLogo ? 'logo' : 'banner'}`);
      setImageUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Preview de la imagen */}
      <div className={`relative ${containerClass} rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-gray-200`}>
        {imageUrl ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={isLogo ? "Logo de la tienda" : "Banner de la tienda"}
            className={`${isLogo ? 'object-contain' : 'object-cover'} w-full h-full`}
            onError={() => setImageUrl(null)}
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-400" />
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
          onChange={handleImageChange}
          disabled={uploading}
        />
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Subiendo...' : `Cambiar ${isLogo ? 'Logo' : 'Banner'}`}
      </label>

      <p className="text-sm text-gray-500 text-center">
        Formatos: PNG, JPG, WebP
        <br />
        Tamaño máximo: 5MB
      </p>
    </div>
  );
};
