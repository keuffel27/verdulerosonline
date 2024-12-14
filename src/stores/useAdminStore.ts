import { create } from 'zustand';
import { getStores } from '../services/stores';
import type { Database } from '../lib/database.types';

type Store = Database['public']['Tables']['stores']['Row'];

interface AdminStore {
  stores: Store[];
  loading: boolean;
  error: string | null;
  fetchStores: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  stores: [],
  loading: false,
  error: null,
  fetchStores: async () => {
    try {
      set({ loading: true, error: null });
      const stores = await getStores();
      set({ stores, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));