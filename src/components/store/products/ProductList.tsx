import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import { ProductCard } from './ProductCard';
import { useCart } from '../../../hooks/useCart';

type Product = Database['public']['Tables']['store_products']['Row'] & {
  presentations: (Database['public']['Tables']['product_presentations']['Row'] & {
    unit: Database['public']['Tables']['measurement_units']['Row']
  })[];
  category?: Database['public']['Tables']['store_categories']['Row'];
};

interface Props {
  storeId: string;
}

export const ProductList: React.FC<Props> = ({ storeId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Database['public']['Tables']['store_categories']['Row'][]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('store_categories')
          .select('*')
          .eq('store_id', storeId)
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch products with presentations and units
        const { data: productsData, error: productsError } = await supabase
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
          .order('order_index');

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const productsSubscription = supabase
      .channel('store_products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_products',
          filter: `store_id=eq.${storeId}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
    };
  }, [storeId]);

  const handleAddToCart = (product: Product, presentationId: string, quantity: number) => {
    const presentation = product.presentations.find(p => p.id === presentationId);
    if (!presentation) return;

    addToCart({
      product,
      presentation,
      quantity
    });

    toast.success('Producto agregado al carrito');
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category_id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas las categorías
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay productos disponibles en esta categoría
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(presentationId, quantity) => 
                handleAddToCart(product, presentationId, quantity)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
