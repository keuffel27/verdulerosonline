import React from 'react';
import { Link } from 'react-router-dom';

interface StoreAdminButtonProps {
  storeId: string;
}

export const StoreAdminButton: React.FC<StoreAdminButtonProps> = ({ storeId }) => {
  return (
    <Link
      to={`/store-login?store=${storeId}`}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      Administrar Tienda
    </Link>
  );
};