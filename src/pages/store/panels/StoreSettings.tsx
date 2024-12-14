import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'react-toastify';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración de la Tienda</h2>
        <p className="mt-1 text-sm text-gray-600">
          Administra la configuración general de tu tienda.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración General
        </h3>
        <p className="text-gray-600 mb-6">
          Próximamente: Configuración de la tienda, notificaciones, y más opciones de personalización.
        </p>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Cuenta
          </h3>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
