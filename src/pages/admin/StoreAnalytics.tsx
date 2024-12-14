import React from 'react';
import { useParams } from 'react-router-dom';
import { useAdminStore } from '../../stores/useAdminStore';
import { ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react';

export const StoreAnalytics: React.FC = () => {
  const { id } = useParams();
  const stores = useAdminStore((state) => state.stores);
  const store = stores.find((s) => s.id === id);

  if (!store) {
    return <div>Tienda no encontrada</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analíticas - {store.name}</h1>
        <p className="text-gray-600">Vista general del rendimiento de la tienda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Últimos 30 días</span>
          </div>
          <h3 className="text-gray-600 text-sm">Pedidos Totales</h3>
          <p className="text-2xl font-bold">142</p>
          <p className="text-sm text-green-600 mt-2">+12.5% vs. mes anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Últimos 30 días</span>
          </div>
          <h3 className="text-gray-600 text-sm">Ingresos</h3>
          <p className="text-2xl font-bold">$8,542</p>
          <p className="text-sm text-green-600 mt-2">+8.2% vs. mes anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Últimos 30 días</span>
          </div>
          <h3 className="text-gray-600 text-sm">Clientes Nuevos</h3>
          <p className="text-2xl font-bold">64</p>
          <p className="text-sm text-green-600 mt-2">+24.3% vs. mes anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Últimos 30 días</span>
          </div>
          <h3 className="text-gray-600 text-sm">Tasa de Conversión</h3>
          <p className="text-2xl font-bold">3.2%</p>
          <p className="text-sm text-green-600 mt-2">+1.2% vs. mes anterior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {['Manzanas', 'Plátanos', 'Tomates', 'Papas', 'Cebollas'].map(
              (product, index) => (
                <div
                  key={product}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-4">#{index + 1}</span>
                    <span>{product}</span>
                  </div>
                  <span className="font-medium">
                    {Math.floor(Math.random() * 100)} kg
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Últimos Pedidos</h3>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">Pedido #{1000 + index}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      Date.now() - index * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-medium">${(Math.random() * 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};