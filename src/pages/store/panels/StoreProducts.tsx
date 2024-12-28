import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Package,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ProductForm } from '../../../components/store/ProductForm';
import { toast } from 'react-toastify';
import noImage from '../../../assets/no-image';
import type { Product, Category } from '../../../types/store';
import { motion, AnimatePresence } from 'framer-motion';

const StoreProducts: React.FC = () => {
  const { storeId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    if (!storeId) return;

    try {
      const { data, error } = await supabase
        .from('store_products')
        .select(`
          *,
          category:store_categories(*),
          presentations:product_presentations(
            *,
            unit:measurement_units(*)
          )
        `)
        .eq('store_id', storeId);

      if (error) throw error;

      setProducts(data || []);
    } catch (error: any) {
      toast.error('Error al cargar los productos');
      console.error('Error:', error.message);
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
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [storeId]);

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('store_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Producto eliminado con éxito');
      fetchProducts();
    } catch (error: any) {
      toast.error('Error al eliminar el producto');
      console.error('Error:', error.message);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!storeId) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-5 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Package className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Productos
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona el catálogo de productos de tu tienda de manera eficiente.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 md:mt-0 md:col-span-2 px-4 py-5 sm:p-6"
          >
            {/* Search and Filter Bar */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <div className="flex-1">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 sm:text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500
                               bg-white/80 backdrop-blur-sm transition-all duration-200"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative group flex-1 sm:flex-none">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  <div className="relative flex items-center bg-white/80 backdrop-blur-sm rounded-lg">
                    <Filter className="absolute left-3 h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                    <select
                      className="block w-full pl-10 pr-10 py-2 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500
                               bg-transparent transition-all duration-200 appearance-none"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
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

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsAddingProduct(true)}
                  className="inline-flex items-center px-4 py-2 rounded-xl shadow-lg text-sm font-medium text-white
                           bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo Producto
                </motion.button>
              </div>
            </motion.div>

            {/* Products List */}
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-green-500 border-t-transparent animate-spin mx-auto"></div>
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin absolute top-0 left-1/2 -translate-x-1/2" 
                       style={{ animationDirection: 'reverse', opacity: 0.5 }}></div>
                </div>
                <p className="mt-4 text-gray-600">Cargando productos...</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden border border-gray-100"
              >
                <AnimatePresence>
                  <ul className="divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                      <motion.li
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-12 text-center"
                      >
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No se encontraron productos</p>
                      </motion.li>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <motion.li
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group hover:bg-green-50/50 transition-colors duration-200"
                        >
                          <div className="px-4 py-4 flex items-center sm:px-6">
                            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                              <div className="flex items-center">
                                <motion.div 
                                  whileHover={{ scale: 1.05 }}
                                  className="relative rounded-lg overflow-hidden"
                                >
                                  {product.image_url ? (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="h-16 w-16 object-cover rounded-lg shadow-md transition-transform duration-200"
                                      onError={(e) => {
                                        e.currentTarget.src = noImage;
                                      }}
                                    />
                                  ) : (
                                    <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md 
                                                   flex items-center justify-center group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-200">
                                      <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-green-500 transition-colors" />
                                    </div>
                                  )}
                                </motion.div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                                    {product.description}
                                  </div>
                                  <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                                    Categoría: {product.category?.name || 'Sin categoría'}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 sm:mt-0 sm:ml-6 flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setEditingProductId(product.id)}
                                  className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-100 transition-all duration-200"
                                >
                                  <Edit2 className="h-5 w-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition-all duration-200"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))
                    )}
                  </ul>
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {(isAddingProduct || editingProductId) && (
          <ProductForm
            storeId={storeId}
            productId={editingProductId}
            categories={categories}
            onClose={() => {
              setIsAddingProduct(false);
              setEditingProductId(null);
            }}
            onSave={() => {
              fetchProducts();
              setIsAddingProduct(false);
              setEditingProductId(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoreProducts;
