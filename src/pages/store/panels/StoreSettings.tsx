import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Settings, Bell, Store, LogOut } from 'lucide-react';

const StoreSettings: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada correctamente');
      navigate('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Configuración de la Tienda
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Administra la configuración general de tu tienda.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Configuración General
            </h3>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center space-x-3 mb-3">
                <Store className="h-5 w-5 text-green-500" />
                <h4 className="font-medium text-green-700">Información de la Tienda</h4>
              </div>
              <p className="text-sm text-gray-600">
                Próximamente: Personaliza el nombre, descripción y detalles de tu tienda.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center space-x-3 mb-3">
                <Bell className="h-5 w-5 text-green-500" />
                <h4 className="font-medium text-green-700">Notificaciones</h4>
              </div>
              <p className="text-sm text-gray-600">
                Próximamente: Configura las notificaciones de pedidos y mensajes.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <LogOut className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900">
                Cuenta
              </h3>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                         shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8 py-2.5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StoreSettings;
