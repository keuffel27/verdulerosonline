import React from 'react';

const StoreSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración de la Tienda</h2>
        <p className="mt-1 text-sm text-gray-600">
          Administra la configuración general de tu tienda.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración General
        </h3>
        <p className="text-gray-600">
          Próximamente: Configuración de la tienda, notificaciones, y más opciones de personalización.
        </p>
      </div>
    </div>
  );
};

export default StoreSettings;
