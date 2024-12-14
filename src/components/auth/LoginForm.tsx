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
      console.log('Iniciando sesión con:', data.email);
      
      // Primero verificamos si existe la tienda
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('email', data.email)
        .single();

      if (storeError || !storeData) {
        throw new Error('No se encontró la tienda asociada a este email');
      }

      // Si la tienda existe, procedemos con el login
      const signInResult = await signIn(data.email, data.password);
      if (!signInResult) {
        throw new Error('Error al iniciar sesión');
      }

      console.log('Sesión iniciada correctamente');
      toast.success('¡Bienvenido!');
      
      // Redirigimos al panel de la tienda con el ID correcto
      navigate(`/store/${storeData.id}/panel/appearance`);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      
      if (errorMessage.toLowerCase().includes('no se encontró la tienda')) {
        toast.error('No hay una tienda asociada a este email');
      } else if (errorMessage.toLowerCase().includes('invalid login credentials') || 
                 errorMessage.toLowerCase().includes('invalid email')) {
        setError('email', { message: 'Credenciales inválidas' });
        setError('password', { message: 'Credenciales inválidas' });
        toast.error('Email o contraseña incorrectos');
      } else if (errorMessage.toLowerCase().includes('network')) {
        toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
      } else {
        toast.error(errorMessage);
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