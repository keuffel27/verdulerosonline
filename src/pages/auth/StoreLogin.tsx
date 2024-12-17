import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../services/supabase';

interface StoreData {
  id: string;
  name: string;
  owner_email: string;
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  access_code: string;
  status: 'active' | 'inactive';
}

export const StoreLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Cerrar cualquier sesión existente primero
      await supabase.auth.signOut();

      // 2. Iniciar sesión con las nuevas credenciales
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('Error de autenticación:', authError);
        throw new Error('Email o contraseña incorrectos');
      }

      if (!session) {
        throw new Error('No se pudo iniciar sesión');
      }

      // 3. Configurar el cliente de Supabase con el nuevo token
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      // 4. Buscar la tienda con el nuevo token
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select(`
          id,
          name,
          owner_email,
          subscription_status,
          access_code,
          status
        `)
        .eq('owner_id', user.id)
        .single();

      if (storeError) {
        console.error('Error al obtener tienda:', storeError);
        await supabase.auth.signOut();
        throw new Error('No se encontró una tienda asociada a este usuario');
      }

      if (!store) {
        await supabase.auth.signOut();
        throw new Error('No se encontró una tienda asociada a este usuario');
      }

      // 5. Verificar estado de la tienda
      if (store.status === 'inactive') {
        await supabase.auth.signOut();
        throw new Error('Esta tienda está desactivada. Por favor, contacta con soporte.');
      }

      // 6. Verificar estado de suscripción
      if (store.subscription_status === 'expired') {
        throw new Error('Tu período de prueba ha expirado. Por favor, contacta con soporte.');
      }

      if (store.subscription_status === 'cancelled') {
        throw new Error('Tu suscripción ha sido cancelada. Por favor, contacta con soporte.');
      }

      // 7. Guardar información relevante
      const storeData: StoreData = {
        id: store.id,
        name: store.name,
        owner_email: store.owner_email,
        subscription_status: store.subscription_status,
        access_code: store.access_code,
        status: store.status
      };

      // 8. Guardar la información de la sesión y la tienda
      localStorage.setItem('store', JSON.stringify(storeData));
      localStorage.setItem('session', JSON.stringify(session));

      // 9. Configurar el evento de renovación de sesión
      supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          localStorage.setItem('session', JSON.stringify(session));
        } else {
          localStorage.removeItem('session');
          localStorage.removeItem('store');
        }
      });

      // 10. Redirigir al panel
      toast.success('¡Bienvenido!');
      navigate(`/store/${store.id}/panel`);
      
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Store className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Inicia sesión en tu tienda
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/store/register" className="font-medium text-green-600 hover:text-green-500">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreLogin;