import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronDown,
  LogOut,
  Bell,
  User,
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useAuthStore } from '../stores/useAuthStore';
import { Logo } from '../components/ui/Logo';
import { toast } from 'react-hot-toast';

interface NavigationItem {
  name: string;
  icon: React.ElementType;
  href: string;
  description: string;
}

const navigation: NavigationItem[] = [
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

export const StorePanelLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { store } = useStore();
  const { signOut } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  const storeUrl = store ? `${window.location.origin}/store/${store.id}` : '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/login');
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const getCurrentPageName = () => {
    const currentPath = location.pathname.split('/').pop();
    const currentPage = navigation.find(item => item.href === currentPath);
    return currentPage?.name || 'Panel';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
          {/* Sidebar Header */}
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <Logo className="w-12 h-12" />
            <span className="ml-2 text-lg font-semibold text-gray-900">
              Panel de Tienda
            </span>
          </div>

          {/* Store URL */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-2">URL de tu tienda:</div>
            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
              <div className="flex-1 truncate text-sm text-gray-700">
                {storeUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                title="Copiar URL"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                title="Abrir tienda"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname.includes(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-green-50 text-green-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon 
                    className={`
                      h-5 w-5 transition-colors duration-200
                      ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} 
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {store?.owner_name || 'Usuario'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div 
        className={`
          lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b
          transition-all duration-200
          ${isScrolled ? 'shadow-md' : ''}
        `}
      >
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
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar Panel */}
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl">
          <div className="h-full flex flex-col">
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center">
                <Logo className="w-10 h-10" />
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  Panel de Tienda
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Store URL */}
            <div className="p-4 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">URL de tu tienda:</div>
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                <div className="flex-1 truncate text-sm text-gray-700">
                  {storeUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 text-gray-500 hover:text-gray-700"
                  title="Copiar URL"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname.includes(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center px-3 py-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-green-50 text-green-700 shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon 
                        className={`
                          h-5 w-5 transition-colors duration-200
                          ${isActive ? 'text-green-500' : 'text-gray-400'}
                        `} 
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Mobile User Menu */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="min-h-screen py-20 lg:py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};
