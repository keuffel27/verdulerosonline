import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/store/ProductCard';
import { StoreNavigation } from '../components/store/StoreNavigation';
import { supabase } from '../lib/supabase';
import type { Product, Category, Store } from '../types/store';
import { Instagram, Facebook, MessageCircle, Clock } from 'lucide-react';

export const StoreFront: React.FC = () => {
  const { storeId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [nextOpenTime, setNextOpenTime] = useState<string>('');

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) return;

      try {
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select(`
            *,
            store_appearance(*),
            store_social_media(*),
            store_schedule(*)
          `)
          .eq('id', storeId)
          .single();

        if (storeError) throw storeError;
        setStore(storeData);

        // Aquí implementarías la lógica para determinar si la tienda está abierta
        // basándote en store_schedule
        // Por ahora lo dejaremos hardcodeado
        setIsOpen(true);
        setNextOpenTime('8h 42m');
      } catch (error) {
        console.error('Error fetching store:', error);
      }
    };

    fetchStoreData();
  }, [storeId]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!storeId) return;

      try {
        const { data, error } = await supabase
          .from('store_categories')
          .select('*')
          .eq('store_id', storeId)
          .order('order_index');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [storeId]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) return;

      try {
        let query = supabase
          .from('store_products')
          .select(`
            *,
            category:store_categories(*),
            presentations:product_presentations(
              *,
              unit:measurement_units(*)
            )
          `)
          .eq('store_id', storeId)
          .eq('status', 'active')
          .order('name');

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Filtrar productos que tienen presentaciones activas
        const productsWithPresentations = data?.filter(
          product => product.presentations?.some(p => p.status === 'active')
        ) || [];
        
        setProducts(productsWithPresentations);
      } catch (error) {
        console.error('Error fetching products:', error);
        // toast.error('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeId, categoryId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información de la tienda */}
      <header className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{store?.name || 'Cargando...'}</h1>
            <div className="flex items-center space-x-4">
              {store?.store_social_media?.instagram_url && (
                <a href={store.store_social_media.instagram_url} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {store?.store_social_media?.facebook_url && (
                <a href={store.store_social_media.facebook_url} target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {store?.store_social_media?.whatsapp_number && (
                <a href={`https://wa.me/${store.store_social_media.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                isOpen ? 'bg-green-400' : 'bg-red-400'
              }`}>
                {isOpen ? 'Abierto' : 'Cerrado'}
              </span>
              {!isOpen && nextOpenTime && (
                <span className="text-sm">
                  Abre en {nextOpenTime}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Barra de navegación y búsqueda */}
      <StoreNavigation storeId={storeId!} categories={categories} />

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Botones de categoría destacados */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {categories.slice(0, 2).map((category) => (
            <button
              key={category.id}
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('category', category.id);
                window.location.search = newSearchParams.toString();
              }}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
            </button>
          ))}
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Cargando productos...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">No hay productos disponibles</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};