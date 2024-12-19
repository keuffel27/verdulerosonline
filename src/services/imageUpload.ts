import axios from 'axios';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

interface UploadResponse {
  url: string;
  delete_url?: string;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  try {
    // Convertir el archivo a base64
    const base64Image = await fileToBase64(file);
    
    // Preparar el form data
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Image.split(',')[1]);
    
    // Hacer la petición a ImgBB
    const response = await axios.post(IMGBB_API_URL, formData);
    
    if (!response.data.success) {
      throw new Error('Error al subir la imagen');
    }
    
    return {
      url: response.data.data.url,
      delete_url: response.data.data.delete_url
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir la imagen');
  }
}

// Función auxiliar para convertir File a base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Función para eliminar una imagen
export async function deleteImage(deleteUrl: string): Promise<void> {
  try {
    await axios.get(deleteUrl);
  } catch (error) {
    console.error('Error deleting image:', error);
    // No lanzamos error aquí ya que la eliminación no es crítica
  }
}
