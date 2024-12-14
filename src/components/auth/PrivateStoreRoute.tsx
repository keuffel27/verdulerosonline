import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

interface PrivateStoreRouteProps {
  children: React.ReactNode;
}

export const PrivateStoreRoute: React.FC<PrivateStoreRouteProps> = ({ children }) => {
  const { storeId } = useParams();
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/store/${storeId}/login`} replace />;
  }

  return <>{children}</>;
};