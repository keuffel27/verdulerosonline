import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenido, {user?.email}
          </p>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              {/* Aquí irán las subrutas del dashboard */}
              <Route index element={<DashboardHome />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const DashboardHome: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Resumen de tu tienda
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-900">Productos</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900">Pedidos</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900">Mensajes</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>
    </div>
  );
};
