import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/store/ProductCard';
import FloatingCart from '../components/store/FloatingCart';
import CartDrawer from '../components/store/CartDrawer';
import { useProducts } from '../hooks/useProducts';

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { products, isLoading, error } = useProducts(storeId);

  if (isLoading) return <div>Cargando productos...</div>;
  if (error) return <div>Error al cargar los productos</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <FloatingCart />
      <CartDrawer />
    </div>
  );
};

export default StorePage;
