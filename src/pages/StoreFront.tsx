import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { StoreNavigation } from '../components/store/StoreNavigation';
import { CategoryGrid } from '../components/store/CategoryGrid';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import type { Product, Category, Store, WeekSchedule } from '../types/store';
import { Instagram, Facebook, MessageCircle, Clock, MapPin } from 'lucide-react';
import { BasicCart } from '../components/store/BasicCart';
import { BasicProductCard } from '../components/store/products/BasicProductCard';
import { isStoreOpen } from '../services/schedule';

export const StoreFront: React.FC = () => {
  const { storeId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean; nextChange: string }>({ isOpen: false, nextChange: '' });

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
              store_address,
              welcome_text,
              primary_color,
              secondary_color
            ),
            store_social_media (
              instagram_url,
              facebook_url,
              whatsapp_number
            ),
            store_schedule (
              schedule
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

        // Procesar el horario
        let schedule: WeekSchedule;
        if (storeData.store_schedule?.schedule) {
          schedule = storeData.store_schedule.schedule;
        } else {
          // Horario por defecto
          schedule = {
            monday: {
              isOpen: true,
              morning: { open: '09:00', close: '13:00' },
              afternoon: { open: '16:00', close: '20:00' },
            },
            tuesday: {
              isOpen: true,
              morning: { open: '09:00', close: '13:00' },
              afternoon: { open: '16:00', close: '20:00' },
            },
            wednesday: {
              isOpen: true,
              morning: { open: '09:00', close: '13:00' },
              afternoon: { open: '16:00', close: '20:00' },
            },
            thursday: {
              isOpen: true,
              morning: { open: '09:00', close: '13:00' },
              afternoon: { open: '16:00', close: '20:00' },
            },
            friday: {
              isOpen: true,
              morning: { open: '09:00', close: '13:00' },
              afternoon: { open: '16:00', close: '20:00' },
            },
            saturday: {
              isOpen: true,
              morning: { open: '09:00', close: '13:00' },
              afternoon: { open: '16:00', close: '20:00' },
            },
            sunday: {
              isOpen: false,
              morning: { open: '09:00', close: '13:00' },
              afternoon: { open: '16:00', close: '20:00' },
            },
          };
        }

        // Calcular si la tienda está abierta
        const status = isStoreOpen(schedule);
        setStoreStatus(status);

        // Actualizar cada minuto
        const interval = setInterval(() => {
          const status = isStoreOpen(schedule);
          setStoreStatus(status);
        }, 60000);

        return () => clearInterval(interval);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            {/* Store Info */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{store?.name}</h1>
                {store?.store_appearance?.welcome_text && (
                  <p className="mt-1 text-gray-600">{store.store_appearance.welcome_text}</p>
                )}
              </div>
              
              {/* Store Status */}
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full 
                  ${storeStatus.isOpen 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    storeStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">{storeStatus.isOpen ? 'Abierto' : 'Cerrado'}</span>
                </div>
                {storeStatus.nextChange && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {storeStatus.nextChange}
                  </span>
                )}
              </div>
            </div>

            {/* Store Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {store?.store_appearance?.store_address && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{store.store_appearance.store_address}</span>
                </div>
              )}
              
              {/* Social Media Links */}
              <div className="flex items-center space-x-3 ml-auto">
                {store?.store_social_media?.instagram_url && (
                  <a
                    href={store.store_social_media.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {store?.store_social_media?.facebook_url && (
                  <a
                    href={store.store_social_media.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {store?.store_social_media?.whatsapp_number && (
                  <a
                    href={`https://wa.me/${store.store_social_media.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Section */}
      {store?.store_appearance?.banner_url && (
        <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
          <img
            src={store.store_appearance.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Navigation */}
        <nav className="mb-8">
          <StoreNavigation categories={categories} />
        </nav>
        
        {/* Products Grid */}
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryProducts = products.filter(
              (product) => product.category_id === category.id
            );

            if (categoryProducts.length === 0) return null;

            return (
              <section key={category.id}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => (
                    <BasicProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <BasicCart />
    </div>
  );
};