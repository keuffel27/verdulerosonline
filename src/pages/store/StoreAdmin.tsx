import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Asegúrate de tener este hook
import { isStoreOwner } from '../../services/storeAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { Home } from 'lucide-react';
import { StoreScheduleEditor } from '../../components/store/schedule/StoreScheduleEditor';

type Store = Database['public']['Tables']['stores']['Row'];

export const StoreAdmin: React.FC = () => {
  const { storeId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !storeId) {
        navigate('/store-login');
        return;
      }

      const hasAccess = await isStoreOwner(user.id, storeId);
      if (!hasAccess) {
        navigate('/store-login');
        return;
      }

      // Cargar datos de la tienda
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (error || !data) {
        navigate('/store-login');
        return;
      }

      setStore(data);
      setLoading(false);
    };

    checkAccess();
  }, [user, storeId, navigate]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center px-6 py-3 text-lg font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Home className="h-6 w-6 mr-2" />
          Ver Mi Landing Page
        </Link>
        <h1 className="text-3xl font-bold text-center">Panel de Administración - {store?.name}</h1>
      </div>
      
      {/* Aquí puedes agregar las secciones para personalizar la tienda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información General</h2>
          {/* Agregar formulario para editar información básica */}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Personalización</h2>
          {/* Agregar opciones de personalización */}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <StoreScheduleEditor storeId={storeId} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Redes Sociales</h2>
          {/* Agregar formulario para redes sociales */}
        </div>
      </div>
    </div>
  );
};
