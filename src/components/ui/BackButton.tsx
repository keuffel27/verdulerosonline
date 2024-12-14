import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Si hay una ruta específica, usarla
    if (to) {
      navigate(to);
      return;
    }

    // Prevenir navegación al login
    if (location.pathname.includes('/store/')) {
      // Si estamos en el panel de la tienda, navegar a la página principal del panel
      const storeId = location.pathname.split('/')[2];
      navigate(`/store/${storeId}/panel/appearance`);
    } else {
      // En otros casos, usar la navegación normal
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      <span>Volver</span>
    </button>
  );
};
