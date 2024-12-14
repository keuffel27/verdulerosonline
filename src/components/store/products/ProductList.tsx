import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { ProductCard } from './ProductCard';
import { Product } from '../../../types/supabase';
import { useCart } from '../../../hooks/useCart';

interface Props {
  storeId: string;
}

export const ProductList: React.FC<Props> = ({ storeId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

        // Fetch products with their presentations
        const { data: productsData, error: productsError } = await supabase
          .from('store_products')
          .select(`
            *,
            store_product_presentations (
              id,
              weight_in_grams,
              price
            )
          `)
          .eq('store_id', storeId)
          .order('name');

        if (productsError) throw productsError;

        // Transform the data to match our type
        const transformedProducts = productsData.map((product: Product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          image_url: product.image_url,
          category_id: product.category_id,
          is_available: product.is_available,
          presentations: product.store_product_presentations || []
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const productsSubscription = supabase
      .channel('products_changes')
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

    const presentationsSubscription = supabase
      .channel('presentations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_product_presentations'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
      presentationsSubscription.unsubscribe();
    };
  }, [storeId]);

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category_id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={() => setSelectedProduct(product)}
            onAddToCart={(quantity) => addToCart(product, quantity)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay productos disponibles en esta categoría.
        </div>
      )}
    </div>
  );
};
