import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, Home } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <img 
              src="/src/assets/images/logo/verdulogo.webp" 
              alt="Verduleros Online Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="font-bold text-xl">Verduleros Online</span>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className={`flex items-center space-x-2 p-2 rounded-lg ${
                  isActive('/admin') && location.pathname === '/admin'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/stores"
                className={`flex items-center space-x-2 p-2 rounded-lg ${
                  isActive('/admin/stores')
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Tiendas</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/stores/create"
                className={`flex items-center space-x-2 p-2 rounded-lg ${
                  isActive('/admin/stores/create')
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span>Crear Tienda</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="flex justify-end mb-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md"
          >
            <Home className="h-5 w-5 mr-2" />
            Ver Landing Page
          </Link>
        </div>
        <Outlet />
      </main>
    </div>
  );
};