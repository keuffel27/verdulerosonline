import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import Landing from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import StorePanel from './pages/store/StorePanel';
import StoreProducts from './pages/store/panels/StoreProducts';
import StoreCategories from './pages/store/panels/StoreCategories';
import StoreSocialMedia from './pages/store/panels/StoreSocialMedia';
import StoreSettings from './pages/store/panels/StoreSettings';
import StoreAppearance from './pages/store/panels/StoreAppearance';
import StoreSchedule from './pages/store/panels/StoreSchedule';
import StorePage from './pages/store/StorePage';
import { CartProvider } from './context/CartContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AuthRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  
  return <>{children}</>;
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <CartProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/auth/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/auth/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />
        <Route path="/store/:storeId" element={<StorePage />} />
        <Route
          path="/store/:storeId/panel/*"
          element={
            <ProtectedRoute>
              <StorePanel />
            </ProtectedRoute>
          }
        >
          <Route path="products" element={<StoreProducts />} />
          <Route path="categories" element={<StoreCategories />} />
          <Route path="social" element={<StoreSocialMedia />} />
          <Route path="settings" element={<StoreSettings />} />
          <Route path="appearance" element={<StoreAppearance />} />
          <Route path="schedule" element={<StoreSchedule />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}

export default App;