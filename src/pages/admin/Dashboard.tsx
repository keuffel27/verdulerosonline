import React, { useEffect, useState } from 'react';
import { Store, TrendingUp, Users } from 'lucide-react';
import { getStores } from '../../services/stores';
import type { Database } from '../../lib/database.types';
import { Link } from 'react-router-dom';

type Store = Database['public']['Tables']['stores']['Row'];

export const AdminDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const storesList = await getStores();
        setStores(storesList);
      } catch (error) {
        console.error('Error loading stores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const stats = [
    {
      name: 'Total Tiendas',
      value: stores.length,
      icon: Store,
      change: '+4.75%',
      changeType: 'positive' as const,
    },
    {
      name: 'Tiendas Activas',
      value: stores.filter(store => store.status === 'active').length,
      icon: Users,
      change: '+54.02%',
      changeType: 'positive' as const,
    },
    {
      name: 'Período de Prueba',
      value: stores.filter(store => store.subscription_status === 'trial').length,
      icon: TrendingUp,
      change: '+12.05%',
      changeType: 'positive' as const,
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon
                    className="h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {item.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span
                  className={`${
                    item.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  } font-medium truncate`}
                >
                  {item.change}
                </span>
                <span className="text-gray-500 ml-2">desde el mes pasado</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Stores */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Tiendas Recientes
        </h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {stores.slice(0, 5).map((store) => (
              <li key={store.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-gray-400 mr-3" />
                      <p className="text-sm font-medium text-green-600 truncate">
                        {store.name}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center space-x-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          store.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {store.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                      <Link
                        to={`/store/${store.id}/login`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Acceder al Panel
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {store.owner_name}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Creada el{' '}
                        {new Date(store.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};