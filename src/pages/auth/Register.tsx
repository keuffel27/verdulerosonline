import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Registrar el usuario en Supabase Auth
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        console.error('Error en signup:', signUpError);
        throw new Error('Error al crear el usuario: ' + signUpError.message);
      }

      if (!user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Iniciar sesión inmediatamente después del registro
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        console.error('Error en signin:', signInError);
        throw new Error('Error al iniciar sesión: ' + signInError.message);
      }

      // 3. Crear el registro en la tabla stores
      const storeSlug = formData.storeName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: formData.storeName,
            slug: storeSlug,
            owner_id: user.id,
            owner_name: formData.ownerName,
            owner_email: formData.email,
            subscription_status: 'trial',
            status: 'active',
            trial_start_date: new Date().toISOString(),
            country: 'Argentina',
            currency: 'ARS',
            timezone: 'America/Argentina/Buenos_Aires'
          }
        ]);

      if (storeError) {
        console.error('Error al crear tienda:', storeError);
        // Intentar eliminar el usuario creado para mantener consistencia
        await supabase.auth.admin.deleteUser(user.id);
        throw new Error('Error al crear la tienda: ' + storeError.message);
      }

      // 4. Cerrar sesión y redirigir al login
      await supabase.auth.signOut();
      
      toast.success('¡Registro exitoso! Por favor, inicia sesión para continuar.');
      navigate('/auth/login');
      
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <motion.div 
        variants={itemVariants}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <motion.div 
          className="flex justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Store className="w-12 h-12 text-green-600" />
        </motion.div>
        <motion.h2 
          variants={itemVariants}
          className="mt-6 text-center text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
        >
          Crear una cuenta
        </motion.h2>
        <motion.p 
          variants={itemVariants}
          className="mt-2 text-center text-sm text-gray-600"
        >
          ¿Ya tienes una cuenta?{' '}
          <motion.span whileHover={{ scale: 1.05 }}>
            <Link to="/auth/login" className="font-medium text-green-600 hover:text-green-500">
              Inicia sesión
            </Link>
          </motion.span>
        </motion.p>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-green-100"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                Nombre de la tienda
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="storeName"
                name="storeName"
                type="text"
                required
                value={formData.storeName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all duration-200 hover:border-green-400"
                placeholder="Ej: Mi Tienda Online"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                Nombre del propietario
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="ownerName"
                name="ownerName"
                type="text"
                required
                value={formData.ownerName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all duration-200 hover:border-green-400"
                placeholder="Tu nombre completo"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all duration-200 hover:border-green-400"
                placeholder="tu@email.com"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all duration-200 hover:border-green-400"
                placeholder="••••••••"
                minLength={6}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all duration-200 hover:border-green-400"
                placeholder="••••••••"
                minLength={6}
              />
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Register;
