import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { uploadImage } from '../../services/imageUpload';
import { OptimizedImage } from '../ui/OptimizedImage';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);

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

      // Usar el servicio de ImgBB para subir la imagen
      const response = await uploadImage(file);
      
      // Actualizar la URL de la imagen
      setImageUrl(response.url);
      
      // Notificar al componente padre
      onImageUploaded(response.url);

      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <input
        type="file"
        onChange={handleImageChange}
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={uploading}
      />
      
      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt="Imagen cargada"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="mt-2 text-sm text-gray-500">
              {uploading ? 'Subiendo...' : 'Haz clic para subir una imagen'}
            </span>
          </div>
        )}
        
        {/* Overlay de carga */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Overlay de hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
          </div>
        </div>
      </div>
    </div>
  );
};
