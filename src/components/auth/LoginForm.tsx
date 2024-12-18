import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('measurement_units')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Error checking connection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

export const LoginForm: React.FC = () => {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      console.log('Verificando conexión...');
      
      // Verificar la conexión antes de intentar el login
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('connection_error');
      }

      console.log('Iniciando sesión con:', data.email);
      
      // Primero autenticamos al usuario
      const signInResult = await signIn(data.email, data.password);
      if (!signInResult) {
        throw new Error('invalid_credentials');
      }

      // Una vez autenticado, buscamos la tienda con timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 30000);
      });

      const storePromise = supabase
        .from('stores')
        .select('id, name, status')
        .eq('owner_email', data.email)
        .single();

      const { data: storeData, error: storeError } = await Promise.race([
        storePromise,
        timeoutPromise
      ]) as any;

      console.log('Resultado de búsqueda de tienda:', { storeData, storeError });

      if (storeError) {
        if (storeError.code === 'PGRST116') {
          await supabase.auth.signOut();
          throw new Error('no_store_found');
        }
        throw storeError;
      }

      if (!storeData) {
        await supabase.auth.signOut();
        throw new Error('no_store_found');
      }

      if (storeData.status !== 'active') {
        await supabase.auth.signOut();
        throw new Error('store_inactive');
      }

      console.log('Sesión iniciada correctamente');
      toast.success('¡Bienvenido!');
      
      navigate(`/store/${storeData.id}/panel/appearance`);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      if (error instanceof Error) {
        switch (error.message) {
          case 'connection_error':
            toast.error('Error de conexión con el servidor. Por favor, verifica tu conexión a internet.');
            break;
          case 'timeout':
            toast.error('La conexión ha excedido el tiempo de espera. Por favor, intenta nuevamente.');
            break;
          case 'no_store_found':
            toast.error('No hay una tienda asociada a este email');
            break;
          case 'store_inactive':
            toast.error('Tu tienda está inactiva. Por favor, contacta con soporte.');
            break;
          case 'invalid_credentials':
            setError('email', { message: 'Credenciales inválidas' });
            setError('password', { message: 'Credenciales inválidas' });
            toast.error('Email o contraseña incorrectos');
            break;
          default:
            if (error.message.toLowerCase().includes('network')) {
              toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
            } else {
              toast.error('Error al iniciar sesión. Por favor, intenta nuevamente.');
            }
        }
      } else {
        toast.error('Error al iniciar sesión. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="text-sm text-center">
        <p className="text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-green-600 hover:text-green-500">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};