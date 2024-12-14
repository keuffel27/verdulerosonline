import React from 'react';
import { useParams } from 'react-router-dom';
import { useAdminStore } from '../../stores/useAdminStore';
import { Button } from '../../components/ui/Button';
import { Store, Clock, Image, Share } from 'lucide-react';

export const StoreSettings: React.FC = () => {
  const { id } = useParams();
  const stores = useAdminStore((state) => state.stores);
  const store = stores.find((s) => s.id === id);

  if (!store) {
    return <div>Tienda no encontrada</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración - {store.name}</h1>
        <p className="text-gray-600">Administra la configuración de tu tienda</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Store className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold">Información General</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                defaultValue={store.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Describe tu tienda..."
              />
            </div>
            <div className="flex justify-end">
              <Button>Guardar Cambios</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold">Horario de Atención</h2>
            </div>
          </div>
          <div className="p-6">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(
              (day) => (
                <div key={day} className="flex items-center justify-between py-3 border-b last:border-0">
                  <span className="font-medium">{day}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                      <span>-</span>
                      <input
                        type="time"
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )
            )}
            <div className="mt-4 flex justify-end">
              <Button>Guardar Horario</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Image className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold">Apariencia</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo de la Tienda
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Store className="w-8 h-8 text-gray-400" />
                </div>
                <Button variant="secondary">Cambiar Logo</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Color Principal
              </label>
              <input
                type="color"
                className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end">
              <Button>Guardar Apariencia</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Share className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold">Redes Sociales</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+1234567890"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <input
                type="text"
                placeholder="@tutienda"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <input
                type="text"
                placeholder="facebook.com/tutienda"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end">
              <Button>Guardar Redes Sociales</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};