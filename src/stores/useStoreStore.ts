import { create } from 'zustand';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from '../services/products';

interface StoreStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (storeId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

export const useStoreStore = create<StoreStore>((set) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async (storeId) => {
    try {
      set({ loading: true, error: null });
      const products = await getProducts(storeId);
      set({ products, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  addProduct: async (product) => {
    try {
      set({ loading: true, error: null });
      const newProduct = await createProduct(product);
      set((state) => ({
        products: [newProduct, ...state.products],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  updateProduct: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedProduct = await updateProduct(id, updates);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? updatedProduct : p
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  removeProduct: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));