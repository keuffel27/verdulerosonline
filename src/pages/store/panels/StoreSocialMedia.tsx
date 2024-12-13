import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

export default function StoreSocialMedia() {
  const { storeId } = useParams();
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar guardado
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
                  htmlFor="instagram"
                  className="flex items-center text-sm font-medium text-gray-700"
                >
                  <Instagram className="h-5 w-5 mr-2 text-pink-500" />
                  Instagram
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="instagram"
                    id="instagram"
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="@tu.tienda"
                    value={socialLinks.instagram}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, instagram: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label
                  htmlFor="facebook"
                  className="flex items-center text-sm font-medium text-gray-700"
                >
                  <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                  Facebook
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="facebook"
                    id="facebook"
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="facebook.com/tu.tienda"
                    value={socialLinks.facebook}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, facebook: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
