import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FloatingCart } from '../../components/store/FloatingCart';
import { Search, MapPin, Clock } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import type { Product, Category } from '../../types/store';
import { ProductCard } from '../../components/store/products/ProductCard';
import { useCart } from '../../hooks/useCart';

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
  const { addToCart } = useCart();

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
      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            {/* Logo */}
            <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 overflow-hidden">
              <img 
                src={store.logo_url || '/default-store-logo.png'} 
                alt={`${store.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Store Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>

            {/* Store Status */}
            <div className={`flex items-center ${isOpen ? 'text-green-600' : 'text-red-600'} mb-2`}>
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-medium">{isOpen ? 'Abierto' : 'Cerrado'}</span>
            </div>

            {/* Store Address */}
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{store.address || 'Dirección no disponible'}</span>
            </div>

            {/* Store Description */}
            <p className="text-gray-600 max-w-lg">
              {store.description || 'Bienvenidos a nuestra tienda online'}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm mt-4">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        ) : selectedCategory === 'all' ? (
          // Mostrar productos agrupados por categoría
          categories.map((category) => (
            <div key={category.id} className="mb-8">
              <h2>{category.name}</h2>
              {groupedProducts[category.id]?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {groupedProducts[category.id].map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(presentationId, quantity) => 
                        addToCart(product, presentationId, quantity)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay productos en esta categoría</p>
              )}
            </div>
          ))
        ) : (
          // Mostrar productos filtrados por categoría seleccionada
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(presentationId, quantity) => 
                  addToCart(product, presentationId, quantity)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart - siempre visible */}
      <FloatingCart />
    </div>
  );
}
