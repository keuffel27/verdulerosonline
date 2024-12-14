import React from 'react';
import { Outlet } from 'react-router-dom';
import { CartDrawer } from '../components/store/cart/CartDrawer';

export const StoreLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <CartDrawer />
    </div>
  );
};