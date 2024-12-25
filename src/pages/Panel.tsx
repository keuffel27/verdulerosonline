import React from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  ShoppingBag,
  Users,
  TrendingUp,
  Settings,
  Bell,
  LogOut,
  Menu as MenuIcon,
  Package,
  Truck,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Panel = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { icon: <Store />, label: 'Dashboard', path: '/panel' },
    { icon: <Package />, label: 'Productos', path: '/panel/products' },
    { icon: <ShoppingBag />, label: 'Pedidos', path: '/panel/orders' },
    { icon: <Users />, label: 'Clientes', path: '/panel/customers' },
    { icon: <Truck />, label: 'Entregas', path: '/panel/deliveries' },
    { icon: <TrendingUp />, label: 'Reportes', path: '/panel/reports' },
    { icon: <MessageCircle />, label: 'Mensajes', path: '/panel/messages' },
    { icon: <Settings />, label: 'Configuración', path: '/panel/settings' },
  ];

  const stats = [
    { label: 'Ventas del día', value: '$15,890', trend: '+12.5%' },
    { label: 'Pedidos pendientes', value: '23', trend: '+5' },
    { label: 'Clientes nuevos', value: '156', trend: '+22%' },
    { label: 'Productos activos', value: '89', trend: '+3' },
  ];

  const recentOrders = [
    { id: '#1234', customer: 'Juan Pérez', total: '$156.00', status: 'Pendiente' },
    { id: '#1235', customer: 'María García', total: '$89.50', status: 'En proceso' },
    { id: '#1236', customer: 'Carlos López', total: '$245.00', status: 'Entregado' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r">
          <div className="flex items-center mb-8 pl-2.5">
            <Store className="w-8 h-8 text-green-600 mr-3" />
            <span className="text-xl font-semibold">Verduleros Online</span>
          </div>
          
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.li
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center p-2.5 text-gray-600 rounded-lg hover:bg-green-50 group"
                >
                  <span className="text-green-600">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                <div className="mt-2 flex items-baseline justify-between">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <span className="text-green-600 text-sm font-medium">{stat.trend}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm mb-8"
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium">Pedidos Recientes</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="py-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-500">{order.customer}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 mr-4">{order.total}</p>
                          <span className="px-2.5 py-0.5 text-sm rounded-full bg-yellow-100 text-yellow-800">
                            {order.status}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link
                  to="/panel/orders"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Ver todos los pedidos
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
