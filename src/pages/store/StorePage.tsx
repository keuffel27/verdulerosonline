import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FloatingCart } from '../../components/store/FloatingCart';
import { Search, MapPin, Clock, Sparkles } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import type { Product, Category } from '../../types/store';
import { ProductCard } from '../../components/store/products/ProductCard';
import { useCart } from '../../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreStatus } from '../../components/store/StoreStatus';

type Store = Database['public']['Tables']['stores']['Row'];

export default function StorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [appearance, setAppearance] = useState<Store['store_appearance'] | null>(null);
  const cart = useCart();

  const addToCart = (product: Product, presentationId: string, quantity: number) => {
    console.log('Adding to cart:', { product, presentationId, quantity }); // Debug log
    const presentation = product.presentations.find(p => p.id === presentationId);
    if (!presentation) {
      console.error('Presentation not found:', presentationId);
      return;
    }

    cart.addItem({
      product,
      presentation,
      quantity
    });

    // Forzar la actualización del FloatingCart
    console.log('Cart items updated in FloatingCart:', cart.items); // Log de depuración para verificar actualización
  };

  const handleAddToCart = (product: Product, presentationId: string, quantity: number) => {
    addToCart(product, presentationId, quantity);
  };

  useEffect(() => {
    if (storeId) {
      fetchStore();
      fetchProducts();
      fetchCategories();
    }
  }, [storeId]);

  const fetchStore = async () => {
    try {
      const { data: storeData, error } = await supabase
        .from('stores')
        .select(`
          *,
          store_schedule(*),
          store_appearance(*)
        `)
        .eq('id', storeId)
        .single();

      if (error) throw error;
      setStore(storeData);
      setAppearance(storeData.store_appearance);
    } catch (error) {
      console.error('Error fetching store:', error);
    }
  };

  const fetchProducts = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      
      const query = supabase
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
        .eq('status', 'active');

      if (selectedCategory !== 'all') {
        query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar productos que tienen presentaciones activas
      const productsWithActivePresentations = data?.filter(product => {
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

  // Efecto para actualizar productos cuando cambia la categoría
  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [selectedCategory]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Agrupar productos por categoría
  const groupedProducts = categories.reduce((acc, category) => {
    acc[category.id] = filteredProducts.filter(
      (product) => product.category_id === category.id
    );
    return acc;
  }, {} as Record<string, Product[]>);

  if (loading || !store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section con Banner y Nombre de la Tienda */}
      <div className="relative">
        {/* Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full h-64 sm:h-72 md:h-96 overflow-hidden"
        >
          {appearance?.banner_url ? (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={appearance.banner_url}
              alt="Banner de la tienda"
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full bg-gradient-to-r from-green-600 to-green-700" 
            />
          )}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" 
          />
          
          {/* Logo y Nombre de la Tienda */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
            {appearance?.logo_url && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.3
                }}
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white shadow-xl mb-4 overflow-hidden border-4 border-white"
              >
                <motion.img 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  src={appearance.logo_url}
                  alt={`${store?.name} logo`}
                  className="relative w-full h-full object-cover"
                />
              </motion.div>
            )}
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2 drop-shadow-lg"
              >
                {store?.name}
              </motion.h1>
              
              {appearance?.welcome_text && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-lg sm:text-xl text-center max-w-2xl mx-auto text-gray-100 drop-shadow mb-4"
                >
                  {appearance.welcome_text}
                </motion.p>
              )}
            </motion.div>
            
            {/* Estado de la tienda y dirección */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-6 py-2 flex items-center space-x-4"
            >
              {storeId && <StoreStatus storeId={storeId} />}
              
              {appearance?.store_address && (
                <>
                  <div className="w-px h-6 bg-gray-300" />
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex items-center text-gray-800"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{appearance.store_address}</span>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Categories */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border-gray-200 bg-white shadow-sm 
                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === 'all'
                  ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              Todas las categorías
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === category.id
                    ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-4 space-y-4 animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron productos que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart */}
      {storeId && <FloatingCart storeId={storeId} />}
    </div>
  );
}
