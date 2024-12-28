import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-5 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50"
          >
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Redes Sociales
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Conecta tu tienda con tus redes sociales para aumentar tu alcance y facilitar la comunicación con tus clientes.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 md:mt-0 md:col-span-2 px-4 py-5 sm:p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Instagram */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="relative group"
              >
                <label
                  htmlFor="instagram_url"
                  className="flex items-center text-sm font-medium text-gray-700 mb-2"
                >
                  <Instagram className="h-5 w-5 mr-2 text-pink-500 group-hover:scale-110 transition-transform" />
                  Instagram
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  <input
                    type="text"
                    name="instagram_url"
                    id="instagram_url"
                    className="relative bg-white shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 block w-full 
                             sm:text-sm border-gray-200 rounded-lg transition-all duration-200 group-hover:border-pink-300"
                    placeholder="@tu.tienda"
                    value={socialLinks.instagram_url}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram_url: e.target.value })}
                  />
                </div>
              </motion.div>

              {/* Facebook */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative group"
              >
                <label
                  htmlFor="facebook_url"
                  className="flex items-center text-sm font-medium text-gray-700 mb-2"
                >
                  <Facebook className="h-5 w-5 mr-2 text-blue-600 group-hover:scale-110 transition-transform" />
                  Facebook
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  <input
                    type="text"
                    name="facebook_url"
                    id="facebook_url"
                    className="relative bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full 
                             sm:text-sm border-gray-200 rounded-lg transition-all duration-200 group-hover:border-blue-300"
                    placeholder="facebook.com/tu.tienda"
                    value={socialLinks.facebook_url}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook_url: e.target.value })}
                  />
                </div>
              </motion.div>

              {/* WhatsApp */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="relative group"
              >
                <label
                  htmlFor="whatsapp_number"
                  className="flex items-center text-sm font-medium text-gray-700 mb-2"
                >
                  <MessageCircle className="h-5 w-5 mr-2 text-green-500 group-hover:scale-110 transition-transform" />
                  WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    id="whatsapp_number"
                    className="relative bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full 
                             sm:text-sm border-gray-200 rounded-lg transition-all duration-200 group-hover:border-green-300"
                    placeholder="Número de WhatsApp (solo números)"
                    value={socialLinks.whatsapp_number}
                    onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp_number: e.target.value })}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ingresa solo números, sin espacios ni caracteres especiales.
                  </p>
                </div>

                {/* Mensaje de WhatsApp personalizado */}
                <div className="mt-4">
                  <label
                    htmlFor="whatsapp_message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mensaje de bienvenida (opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                    <textarea
                      name="whatsapp_message"
                      id="whatsapp_message"
                      rows={3}
                      className="relative bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full 
                               sm:text-sm border-gray-200 rounded-lg transition-all duration-200 group-hover:border-green-300"
                      placeholder="Hola, gracias por contactarnos..."
                      value={socialLinks.whatsapp_message}
                      onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp_message: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex justify-end pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 rounded-xl shadow-lg text-sm font-medium text-white
                           bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
