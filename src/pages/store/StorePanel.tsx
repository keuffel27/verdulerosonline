import React, { useState, Suspense, useEffect } from 'react';
import { useParams, Link, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Menu,
  X as CloseIcon,
  ShoppingBag,
  Image,
  Share2,
  Clock,
  Settings,
  LayoutGrid,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';
import { StorePreview } from '../../components/store/StorePreview';
import { LogoUploader } from '../../components/store/LogoUploader';
import { useStore } from '../../hooks/useStore';
import { OptimizedImage } from '../../components/ui/OptimizedImage';
import { motion } from 'framer-motion';

// Componentes de las diferentes secciones
const StoreAppearance = React.lazy(() => import('./panels/StoreAppearance'));
const StoreSocialMedia = React.lazy(() => import('./panels/StoreSocialMedia'));
const StoreSchedule = React.lazy(() => import('./panels/StoreSchedule'));
const StoreCategories = React.lazy(() => import('./panels/StoreCategories'));
const StoreProducts = React.lazy(() => import('./panels/StoreProducts'));
const StoreSettings = React.lazy(() => import('./panels/StoreSettings'));

const StorePanel: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { store, appearance } = useStore(storeId);

  const storeUrl = `${window.location.origin}/store/${storeId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setIsCopied(true);
      toast.success('¡URL copiada al portapapeles!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
      toast.error('No se pudo copiar la URL');
    }
  };

  const navigation = [
    {
      name: 'Apariencia',
      icon: Image,
      href: 'appearance',
      description: 'Personaliza el diseño y estilo de tu tienda',
    },
    {
      name: 'Redes Sociales',
      icon: Share2,
      href: 'social',
      description: 'Configura tus enlaces a redes sociales',
    },
    {
      name: 'Horarios',
      icon: Clock,
      href: 'schedule',
      description: 'Gestiona los horarios de atención',
    },
    {
      name: 'Categorías',
      icon: LayoutGrid,
      href: 'categories',
      description: 'Organiza tus productos en categorías',
    },
    {
      name: 'Productos',
      icon: ShoppingBag,
      href: 'products',
      description: 'Administra tu catálogo de productos',
    },
    {
      name: 'Configuración',
      icon: Settings,
      href: 'settings',
      description: 'Configura los ajustes generales de tu tienda',
    },
  ];

  const getCurrentPageName = () => {
    const currentPath = location.pathname.split('/').pop();
    const currentPage = navigation.find(item => item.href === currentPath);
    return currentPage?.name || 'Panel';
  };

  if (!storeId) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-lg border-b fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-green-600 transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {getCurrentPageName()}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-30 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white/95 backdrop-blur-lg shadow-2xl transform transition-transform duration-300">
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <div className="flex items-center">
                <OptimizedImage
                  src="/src/assets/images/logo/verdulogo.webp"
                  alt="Verduleros Online Logo"
                  className="w-20 h-20 object-contain"
                />
                <span className="ml-2 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Panel de Tienda
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-green-600 transition-colors duration-200"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Store URL */}
            <div className="p-4 border-b bg-gradient-to-r from-green-500/5 to-emerald-500/5">
              <div className="text-sm font-medium text-gray-600 mb-2">URL de tu tienda:</div>
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
                <div className="flex-1 truncate p-2 text-sm text-gray-600">
                  {storeUrl}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="p-2 text-gray-500 hover:text-green-600 transition-colors duration-200"
                  title="Copiar URL"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </motion.button>
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-green-600 transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname.includes(item.href);
                  return (
                    <motion.div
                      key={item.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-green-500'}`} />
                        <div className="ml-3">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className={`text-xs ${isActive ? 'text-green-50' : 'text-gray-500'}`}>
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">
        <div className="flex-1 flex flex-col min-h-0 bg-white/90 backdrop-blur-lg border-r shadow-xl">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <OptimizedImage
              src="/src/assets/images/logo/verdulogo.webp"
              alt="Verduleros Online Logo"
              className="w-20 h-20 object-contain"
            />
            <span className="ml-2 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Panel de Tienda
            </span>
          </div>

          {/* Store URL */}
          <div className="p-4 border-b bg-gradient-to-r from-green-500/5 to-emerald-500/5">
            <div className="text-sm font-medium text-gray-600 mb-2">URL de tu tienda:</div>
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
              <div className="flex-1 truncate p-2 text-sm text-gray-600">
                {storeUrl}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink}
                className="p-2 text-gray-500 hover:text-green-600 transition-colors duration-200"
                title="Copiar URL"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
              <motion.a
                whileTap={{ scale: 0.95 }}
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-green-600 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.includes(item.href);
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-green-500'}`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className={`text-xs ${isActive ? 'text-green-50' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="pb-16 pt-20 lg:pt-0">
              <Suspense fallback={
                <div className="flex justify-center items-center h-64">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', opacity: 0.5 }}></div>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Navigate to="appearance" replace />} />
                  <Route path="appearance" element={<StoreAppearance />} />
                  <Route path="social" element={<StoreSocialMedia />} />
                  <Route path="schedule" element={<StoreSchedule />} />
                  <Route path="categories" element={<StoreCategories />} />
                  <Route path="products" element={<StoreProducts />} />
                  <Route path="settings" element={<StoreSettings />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {/* Store Preview */}
      <motion.div
        initial={false}
        animate={{
          width: previewExpanded ? '100%' : '400px',
          height: previewExpanded ? '100vh' : '600px',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 ${
          previewVisible ? 'block' : 'hidden'
        }`}
      >
        <StorePreview
          storeId={storeId}
          isVisible={previewVisible}
          isExpanded={previewExpanded}
          onToggleVisibility={() => setPreviewVisible(!previewVisible)}
          onToggleExpand={() => setPreviewExpanded(!previewExpanded)}
        />
      </motion.div>

      {/* Preview Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPreviewVisible(!previewVisible)}
        className={`fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-lg 
          ${previewVisible 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
          } text-white transition-colors duration-200`}
      >
        {previewVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default StorePanel;