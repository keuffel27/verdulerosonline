import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/store/products/ProductCard';
import { StoreNavigation } from '../components/store/StoreNavigation';
import { CategoryGrid } from '../components/store/CategoryGrid';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import type { Product, Category, Store } from '../types/store';
import { Instagram, Facebook, MessageCircle, Clock } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export const StoreFront: React.FC = () => {
  const { storeId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [nextOpenTime, setNextOpenTime] = useState<string>('');

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) return;

      try {
        setLoading(true);
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select(`
            id,
            name,
            description,
            status,
            store_appearance (
              logo_url,
              banner_url,
              primary_color,
              secondary_color
            ),
            store_social_media (
              instagram_url,
              facebook_url,
              whatsapp_number
            ),
            store_schedule (
              *
            )
          `)
          .eq('id', storeId)
          .eq('status', 'active')
          .single();

        if (storeError) {
          console.error('Error fetching store:', storeError);
          return;
        }

        setStore(storeData);
        setIsOpen(true); // Temporal, luego implementar lógica real
        setNextOpenTime('8h 42m');
      } catch (error) {
        console.error('Error fetching store:', error);
      } finally {
        setLoading(false);
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
          .select('id, name, order_index')
          .eq('store_id', storeId)
          .order('order_index');

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }
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
        setLoading(true);
        
        const query = supabase
          .from('store_products')
          .select(`
            id,
            name,
            description,
            image_url,
            status,
            category:store_categories (
              id,
              name
            ),
            presentations:product_presentations (
              id,
              quantity,
              price,
              stock,
              status,
              is_default,
              unit:measurement_units (
                id,
                name,
                symbol
              )
            )
          `)
          .eq('store_id', storeId)
          .eq('status', 'active');

        if (categoryId && categoryId !== 'all') {
          query.eq('category_id', categoryId);
        }

        const { data: productsData, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        const productsWithActivePresentations = productsData?.filter(product => {
          const activePresentations = product.presentations?.filter(p => p.status === 'active') || [];
          product.presentations = activePresentations;
          return activePresentations.length > 0;
        }) || [];

        setProducts(productsWithActivePresentations);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeId, categoryId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/10 to-gray-100">
      {/* Store Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-green-100/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            {/* Logo y Nombre de la Tienda */}
            <div className="flex-1 flex flex-col items-center md:items-start">
              {store?.store_appearance?.logo_url ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <img
                    src={store.store_appearance.logo_url}
                    alt={store.name}
                    className="relative w-full h-full object-contain rounded-full"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {store?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{store?.name}</h1>
              {store?.description && (
                <p className="mt-1 text-sm sm:text-base text-gray-600 max-w-md">{store.description}</p>
              )}
            </div>

            {/* Estado de la tienda */}
            <div className="flex flex-col items-center md:items-end space-y-2">
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="font-medium">
                  {isOpen ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
              {!isOpen && nextOpenTime && (
                <p className="text-sm text-gray-500">
                  Abre en {nextOpenTime}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categorías y Productos */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Título de Categorías */}
        <div className="text-center mb-8 sm:mb-12">
          <h2>Nuestras Categorías</h2>
          <p className="mt-4 sm:mt-6 text-gray-600 max-w-2xl mx-auto font-medium text-sm sm:text-base">
            Explora nuestra selección de productos frescos organizados por categorías
          </p>
          <div className="relative mt-4 sm:mt-6 flex justify-center">
            <div className="absolute top-1/2 -translate-y-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-green-300/50 to-transparent"></div>
            <div className="w-2 h-2 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full shadow-lg shadow-green-500/30"></div>
          </div>
        </div>

        {/* Categorías */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <CategoryGrid
            categories={categories}
            currentCategory={categoryId}
            onCategoryChange={(id) => {
              const newSearchParams = new URLSearchParams(searchParams);
              if (id) {
                newSearchParams.set('category', id);
              } else {
                newSearchParams.delete('category');
              }
              navigate(`/store/${storeId}?${newSearchParams.toString()}`);
            }}
          />
        </div>

        {/* Productos */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(presentationId, quantity) =>
                addToCart(product, presentationId, quantity)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};