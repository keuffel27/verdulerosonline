import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import { CartProvider } from './context/CartContext';

// Componente de carga
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
  </div>
);

// Lazy loading de componentes
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.default })));
const Login = lazy(() => import('./pages/auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(module => ({ default: module.Register })));
const StorePanel = lazy(() => import('./pages/store/StorePanel').then(module => ({ default: module.default })));
const StoreProducts = lazy(() => import('./pages/store/panels/StoreProducts').then(module => ({ default: module.default })));
const StoreCategories = lazy(() => import('./pages/store/panels/StoreCategories').then(module => ({ default: module.default })));
const StoreSocialMedia = lazy(() => import('./pages/store/panels/StoreSocialMedia').then(module => ({ default: module.default })));
const StoreSettings = lazy(() => import('./pages/store/panels/StoreSettings').then(module => ({ default: module.default })));
const StoreAppearance = lazy(() => import('./pages/store/panels/StoreAppearance').then(module => ({ default: module.default })));
const StoreSchedule = lazy(() => import('./pages/store/panels/StoreSchedule').then(module => ({ default: module.default })));
const StorePage = lazy(() => import('./pages/store/StorePage').then(module => ({ default: module.default })));

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
    return <LoadingSpinner />;
  }

  return (
    <>
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
      <CartProvider>
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
      </CartProvider>
    </>
  );
}

export default App;