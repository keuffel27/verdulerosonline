import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { getStoreByEmail, getStoreById, StoreError } from '../../services/stores';
import { BackButton } from '../../components/ui/BackButton';
import { useAuthStore } from '../../stores/useAuthStore';
import { Logo } from '../../components/ui/Logo';

export const StoreLogin: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!storeId);
  const [storeName, setStoreName] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const signIn = useAuthStore(state => state.signIn);

  useEffect(() => {
    const loadStoreInfo = async () => {
      if (storeId) {
        try {
          const store = await getStoreById(storeId);
          setStoreName(store.name);
        } catch (err) {
          if (err instanceof StoreError) {
            setError(err.message);
          } else {
            setError('Error al cargar la información de la tienda');
          }
        } finally {
          setInitialLoading(false);
        }
      }
    };
    
    if (storeId) {
      loadStoreInfo();
    }
  }, [storeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usar el signIn del store de autenticación
      await signIn(formData.email, formData.password);

      const store = await getStoreByEmail(formData.email);
      
      if (storeId && store.id !== storeId) {
        throw new StoreError('Este email no corresponde a esta tienda');
      }

      if (store.status !== 'active') {
        throw new StoreError('Esta tienda está desactivada. Por favor, contacta con soporte.');
      }

      if (store.subscription_status === 'expired') {
        throw new StoreError('Tu período de prueba ha expirado. Por favor, contacta con soporte.');
      }

      toast.success('¡Bienvenido de vuelta!');
      navigate(`/store/${store.id}/panel`);
    } catch (err) {
      console.error('Error during login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="mt-2 text-sm text-gray-600">Cargando información de la tienda...</p>
      </div>
    );
  }

  if (storeId && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <Logo className="w-20 h-20 text-red-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <button
          onClick={() => navigate('/store/login')}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Volver al login general
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="absolute top-4 left-4">
          <BackButton to="/" />
        </div>
        <div className="flex justify-center">
          <Logo className="w-20 h-20" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {storeName ? `Acceso a ${storeName}` : 'Acceso a tu Tienda'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {storeId ? 'Ingresa tus credenciales para acceder' : 'Ingresa tus credenciales para administrar tu tienda'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
