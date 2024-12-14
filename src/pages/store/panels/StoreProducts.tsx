import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ProductForm } from '../../../components/store/ProductForm';
import { toast } from 'react-toastify';
import noImage from '../../../assets/no-image';
import type { Product, Category } from '../../../types/store';

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
          category:store_categories(*)
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
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Productos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona el catálogo de productos de tu tienda.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            {/* Search and Filter Bar */}
            <div className="mb-6 flex space-x-4">
              <div className="flex-1">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
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
              <button
                type="button"
                onClick={() => setIsAddingProduct(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Producto
              </button>
            </div>

            {/* Products List */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando productos...</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <li className="px-4 py-12 text-center text-gray-500">
                      No se encontraron productos
                    </li>
                  ) : (
                    filteredProducts.map((product) => (
                      <li key={product.id}>
                        <div className="px-4 py-4 flex items-center sm:px-6">
                          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                            <div className="flex items-center">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-12 w-12 object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.src = noImage;
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.description}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Categoría: {product.category?.name || 'Sin categoría'}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  product.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingProductId(product.id)}
                                  className="p-1 hover:bg-gray-100 rounded-full"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1 hover:bg-gray-100 rounded-full text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {(isAddingProduct || editingProductId) && (
        <ProductForm
          storeId={storeId}
          productId={editingProductId || undefined}
          onClose={() => {
            setIsAddingProduct(false);
            setEditingProductId(null);
          }}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
};

export default StoreProducts;
