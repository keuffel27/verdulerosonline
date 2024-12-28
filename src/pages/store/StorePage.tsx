import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FloatingCart } from '../../components/store/FloatingCart';
import { Search, MapPin, Clock, Sparkles, Instagram, Facebook, MessageCircle } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import type { Product, Category } from '../../types/store';
import { ProductCard } from '../../components/store/products/ProductCard';
import { useCart } from '../../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { isStoreOpen } from '../../services/schedule';

type Store = Database['public']['Tables']['stores']['Row'];

export default function StorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean; nextChange: string }>({ 
    isOpen: false, 
    nextChange: 'Cargando...' 
  });
  const [isOpen, setIsOpen] = useState(false);
  const [appearance, setAppearance] = useState<Store['store_appearance'] | null>(null);
  const [socialMedia, setSocialMedia] = useState<{
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  }>({});
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
      fetchSocialMedia();
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

      // Configurar el estado de la tienda
      if (storeData.store_schedule?.schedule) {
        const status = isStoreOpen(storeData.store_schedule.schedule);
        setStoreStatus(status);

        // Actualizar el estado cada minuto
        const interval = setInterval(() => {
          const newStatus = isStoreOpen(storeData.store_schedule.schedule);
          setStoreStatus(newStatus);
        }, 60000);

        return () => clearInterval(interval);
      }
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

  const fetchSocialMedia = async () => {
    if (!storeId) return;
    
    const { data, error } = await supabase
      .from('store_social_media')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (!error && data) {
      setSocialMedia({
        instagram: data.instagram_url,
        facebook: data.facebook_url,
        whatsapp: data.whatsapp_number,
      });
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
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4
                }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2 drop-shadow-lg"
              >
                {appearance?.display_name || store?.name}
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
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-8 py-3 flex items-center space-x-6 border border-white/20"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  storeStatus.isOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  {storeStatus.isOpen ? 'Abierto' : 'Cerrado'} - {storeStatus.nextChange}
                </span>
              </motion.div>
              
              {appearance?.store_address && (
                <>
                  <div className="h-8 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="flex items-center text-gray-700 group hover:text-gray-900 transition-colors"
                  >
                    <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors mr-3">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{appearance.store_address}</span>
                  </motion.div>

                  {/* Separador para redes sociales */}
                  <div className="h-8 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />
                  
                  {/* Botones de redes sociales */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    className="flex items-center space-x-3"
                  >
                    {socialMedia.instagram && (
                      <motion.a
                        href={socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white hover:shadow-lg transition-shadow"
                      >
                        <Instagram className="w-5 h-5" />
                      </motion.a>
                    )}
                    
                    {socialMedia.facebook && (
                      <motion.a
                        href={socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white hover:shadow-lg transition-shadow"
                      >
                        <Facebook className="w-5 h-5" />
                      </motion.a>
                    )}
                    
                    {socialMedia.whatsapp && (
                      <motion.a
                        href={`https://wa.me/${socialMedia.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-full text-white hover:shadow-lg transition-shadow"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </motion.a>
                    )}
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="relative">
        {/* Sección de Productos */}
        <div 
          className="min-h-screen relative"
          style={{
            backgroundImage: appearance?.products_background_url ? `url(${appearance.products_background_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Search and Categories */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm shadow-lg 
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               placeholder-gray-400 transition-shadow duration-300
                               group-hover:shadow-xl"
                    />
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <motion.div 
                className="flex flex-wrap justify-center gap-3"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                <motion.button
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300
                    transform hover:-translate-y-0.5 hover:shadow-lg ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20'
                      : 'bg-white/90 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                  Todas las categorías
                </motion.button>
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300
                      transform hover:-translate-y-0.5 hover:shadow-lg ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20'
                        : 'bg-white/90 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>

            {/* Products Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 space-y-4"
                    >
                      <div className="w-full h-48 bg-gray-200 rounded-lg" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </motion.div>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12"
                  >
                    <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No se encontraron productos que coincidan con tu búsqueda.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Floating Cart */}
      {storeId && <FloatingCart storeId={storeId} />}
    </div>
  );
}
