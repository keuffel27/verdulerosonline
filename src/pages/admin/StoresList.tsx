import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/useAdminStore';
import { Button } from '../../components/ui/Button';
import { Plus, ExternalLink, Settings, BarChart } from 'lucide-react';

export const StoresList: React.FC = () => {
  const { stores, loading, fetchStores } = useAdminStore((state) => ({
    stores: state.stores,
    loading: state.loading,
    fetchStores: state.fetchStores
  }));

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tiendas</h1>
        <Link to="/admin/stores/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tienda
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">No hay tiendas creadas</h2>
          <p className="text-gray-600 mb-4">
            Comienza creando tu primera tienda
          </p>
          <Link to="/admin/stores/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Tienda
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Total de Tiendas</h3>
              <p className="text-3xl font-bold text-green-600">{stores.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Tiendas Activas</h3>
              <p className="text-3xl font-bold text-green-600">
                {stores.filter((store) => store.status === 'active').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Tiendas Inactivas</h3>
              <p className="text-3xl font-bold text-gray-600">
                {stores.filter((store) => store.status === 'inactive').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4">Nombre</th>
                    <th className="text-left p-4">Dueño</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Creada</th>
                    <th className="text-right p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-gray-500">{store.slug}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{store.owner_name}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            store.status
                          )}`}
                        >
                          {store.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(store.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/stores/${store.id}/analytics`}
                            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                            title="Analíticas"
                          >
                            <BarChart className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/admin/stores/${store.id}/settings`}
                            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                            title="Configuración"
                          >
                            <Settings className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/store/${store.slug}`}
                            target="_blank"
                            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                            title="Ver tienda"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};