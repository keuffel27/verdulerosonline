import React, { useState } from 'react';
import { useParams, Link, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
} from 'lucide-react';
import { toast } from 'react-toastify';
import { BackButton } from '../../components/ui/BackButton';
import { StorePreview } from '../../components/store/StorePreview';

// Componentes de las diferentes secciones
const StoreAppearance = React.lazy(() => import('./panels/StoreAppearance'));
const StoreSocialMedia = React.lazy(() => import('./panels/StoreSocialMedia'));
const StoreSchedule = React.lazy(() => import('./panels/StoreSchedule'));
const StoreCategories = React.lazy(() => import('./panels/StoreCategories'));
const StoreProducts = React.lazy(() => import('./panels/StoreProducts'));
const StoreSettings = React.lazy(() => import('./panels/StoreSettings'));

export const StorePanel: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const storeUrl = `${window.location.origin}/store/${storeId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success('¡Enlace copiado al portapapeles!');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigation = [
    {
      name: 'Apariencia',
      icon: Image,
      href: `appearance`,
      description: 'Personaliza el diseño y estilo de tu tienda',
    },
    {
      name: 'Redes Sociales',
      icon: Share2,
      href: `social`,
      description: 'Configura tus enlaces a redes sociales',
    },
    {
      name: 'Horarios',
      icon: Clock,
      href: `schedule`,
      description: 'Gestiona los horarios de atención',
    },
    {
      name: 'Categorías',
      icon: LayoutGrid,
      href: `categories`,
      description: 'Organiza tus productos en categorías',
    },
    {
      name: 'Productos',
      icon: ShoppingBag,
      href: `products`,
      description: 'Administra tu catálogo de productos',
    },
    {
      name: 'Configuración',
      icon: Settings,
      href: `settings`,
      description: 'Configura los ajustes generales de tu tienda',
    },
  ];

  if (!storeId) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } fixed inset-y-0 left-0 w-64 transition duration-300 transform bg-white overflow-y-auto lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 border-b px-4">
          <div className="flex items-center">
            <Store className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-lg font-semibold text-gray-800">
              Panel de Tienda
            </span>
          </div>
        </div>

        <nav className="mt-5 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon
                  className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 lg:hidden"
          >
            <span className="sr-only">Abrir sidebar</span>
            <Store className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center mb-4">
                <BackButton />
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setPreviewVisible(!previewVisible)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {previewVisible ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Ocultar Vista Previa
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Mostrar Vista Previa
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </button>
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Tienda
                  </a>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className={`flex-1 ${previewVisible ? 'w-2/3' : 'w-full'}`}>
                  <Outlet />
                </div>
                {previewVisible && (
                  <div className={`w-1/3 ${previewExpanded ? 'fixed inset-0 z-50 w-full' : ''}`}>
                    <StorePreview
                      storeId={storeId}
                      expanded={previewExpanded}
                      onToggleExpand={() => setPreviewExpanded(!previewExpanded)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StorePanel;