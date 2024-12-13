import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  storeId: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setStoreId: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  storeId: null,

  setStoreId: (id: string) => set({ storeId: id }),

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      // Intentamos el login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        set({ error: authError.message, loading: false });
        return false;
      }
      
      if (!authData.user) {
        set({ error: 'No se pudo obtener la información del usuario', loading: false });
        return false;
      }

      // Actualizamos el estado
      set({ 
        user: authData.user,
        loading: false,
        error: null
      });

      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false 
      });
      return false;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, storeId: null, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al cerrar sesión',
        loading: false,
      });
    }
  },

  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        set({ 
          user: session.user,
          loading: false,
          error: null
        });
      } else {
        set({ 
          user: null, 
          storeId: null,
          loading: false,
          error: null 
        });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ 
        user: null, 
        storeId: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al verificar la autenticación'
      });
    }
  },
}));