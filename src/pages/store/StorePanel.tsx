import React, { useState } from 'react';
import { useParams, Link, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Store,
  Settings,
  Clock,
  Image,
  Share2,
  ShoppingBag,
  LayoutGrid,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Check,
  Menu,
  X as XIcon,
  ChevronLeft,
} from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';
import { StorePreview } from '../../components/store/StorePreview';

// Componentes de las diferentes secciones
import StoreAppearance from './panels/StoreAppearance';
import StoreSocialMedia from './panels/StoreSocialMedia';
import StoreSchedule from './panels/StoreSchedule';
import StoreCategories from './panels/StoreCategories';
import StoreProducts from './panels/StoreProducts';
import StoreSettings from './panels/StoreSettings';

const StorePanel: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-semibold text-gray-900">{getCurrentPageName()}</span>
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
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white">
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <div className="flex items-center">
                <Store className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-lg font-semibold text-gray-800">
                  Panel de Tienda
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Store URL */}
            <div className="p-4 border-b">
              <div className="text-sm text-gray-600 mb-2">URL de tu tienda:</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 truncate bg-gray-50 p-2 rounded text-sm">
                  {storeUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Copiar URL"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname.includes(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
                      <div className="ml-3">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <Store className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-lg font-semibold text-gray-800">
              Panel de Tienda
            </span>
          </div>

          {/* Store URL */}
          <div className="p-4 border-b">
            <div className="text-sm text-gray-600 mb-2">URL de tu tienda:</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 truncate bg-gray-50 p-2 rounded text-sm">
                {storeUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Copiar URL"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.includes(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
                  <div className="ml-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="pb-16 pt-20 lg:pt-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Floating Preview Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setPreviewVisible(!previewVisible)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            previewVisible
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {previewVisible ? (
            <>
              <EyeOff className="w-5 h-5" />
              <span className="hidden sm:inline">Ocultar vista previa</span>
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              <span className="hidden sm:inline">Ver vista previa</span>
            </>
          )}
        </button>
      </div>

      {/* Store Preview */}
      <StorePreview
        storeId={storeId}
        isVisible={previewVisible}
        isExpanded={previewExpanded}
        onToggleVisibility={() => setPreviewVisible(false)}
        onToggleExpand={() => setPreviewExpanded(!previewExpanded)}
      />
    </div>
  );
};

export default StorePanel;