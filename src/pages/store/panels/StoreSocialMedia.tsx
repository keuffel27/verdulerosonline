import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

interface SocialLinks {
  instagram_url: string;
  facebook_url: string;
  whatsapp_number: string;
  whatsapp_message: string;
}

export default function StoreSocialMedia() {
  const { storeId } = useParams();
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram_url: '',
    facebook_url: '',
    whatsapp_number: '',
    whatsapp_message: ''
  });

  // Cargar datos existentes
  useEffect(() => {
    async function loadSocialMedia() {
      if (!storeId) return;

      try {
        const { data, error } = await supabase
          .from('store_social_media')
          .select('*')
          .eq('store_id', storeId)
          .single();

        if (error) {
          // Solo mostrar el error si no es un error de "no se encontraron registros"
          if (error.code !== 'PGRST116') {
            console.error('Error loading social media:', error);
            toast.error('Error al cargar las redes sociales');
          }
          return;
        }

        if (data) {
          setSocialLinks(data);
        }
      } catch (error: any) {
        console.error('Error loading social media:', error);
        toast.error('Error al cargar las redes sociales');
      }
    }

    loadSocialMedia();
  }, [storeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    setLoading(true);
    try {
      // Validar número de WhatsApp
      if (socialLinks.whatsapp_number) {
        const whatsappNumber = socialLinks.whatsapp_number.replace(/\D/g, '');
        if (whatsappNumber.length < 10) {
          throw new Error('El número de WhatsApp debe tener al menos 10 dígitos');
        }
        socialLinks.whatsapp_number = whatsappNumber;
      }

      const { error } = await supabase
        .from('store_social_media')
        .upsert({
          store_id: storeId,
          ...socialLinks
        });

      if (error) throw error;

      toast.success('Redes sociales actualizadas correctamente');
    } catch (error: any) {
      console.error('Error saving social media:', error);
      toast.error(error.message || 'Error al guardar las redes sociales');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Redes Sociales
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Conecta tu tienda con tus redes sociales para aumentar tu alcance.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Instagram */}
              <div>
                <label
                  htmlFor="instagram_url"
                  className="flex items-center text-sm font-medium text-gray-700"
                >
                  <Instagram className="h-5 w-5 mr-2 text-pink-500" />
                  Instagram
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="instagram_url"
                    id="instagram_url"
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="@tu.tienda"
                    value={socialLinks.instagram_url}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, instagram_url: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label
                  htmlFor="facebook_url"
                  className="flex items-center text-sm font-medium text-gray-700"
                >
                  <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                  Facebook
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="facebook_url"
                    id="facebook_url"
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="facebook.com/tu.tienda"
                    value={socialLinks.facebook_url}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, facebook_url: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label
                  htmlFor="whatsapp_number"
                  className="flex items-center text-sm font-medium text-gray-700"
                >
                  <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                  WhatsApp
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="whatsapp_number"
                    id="whatsapp_number"
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Número de WhatsApp (solo números)"
                    value={socialLinks.whatsapp_number}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, whatsapp_number: e.target.value })
                    }
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ingresa solo números, sin espacios ni caracteres especiales.
                  </p>
                </div>

                {/* Mensaje de WhatsApp personalizado */}
                <div className="mt-4">
                  <label
                    htmlFor="whatsapp_message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mensaje de bienvenida (opcional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="whatsapp_message"
                      id="whatsapp_message"
                      rows={3}
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Hola, gracias por contactarnos..."
                      value={socialLinks.whatsapp_message}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, whatsapp_message: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }`}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
