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
      
      // Primero intentamos el login
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

      // Luego verificamos si existe la tienda
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name, slug')
        .eq('owner_email', email)
        .single();

      if (storeError) {
        // Si no existe la tienda, la creamos
        const storeName = email.split('@')[0];
        const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const storeId = `store_${Date.now()}`;

        // Crear la tienda
        const { error: createStoreError } = await supabase
          .from('stores')
          .insert([
            {
              id: storeId,
              name: storeName,
              slug: storeSlug,
              owner_id: authData.user.id,
              owner_name: storeName,
              owner_email: email,
              description: `Tienda de ${storeName}`,
              trial_start_date: new Date().toISOString(),
              subscription_status: 'trial',
              status: 'active'
            }
          ]);

        if (createStoreError) {
          set({ error: 'Error al crear la tienda', loading: false });
          return false;
        }

        // Crear la configuración de apariencia
        await supabase
          .from('store_appearance')
          .insert([
            {
              store_id: storeId,
              primary_color: '#3B82F6',
              secondary_color: '#1D4ED8'
            }
          ]);

        // Crear el horario por defecto
        await supabase
          .from('store_schedule')
          .insert([
            {
              store_id: storeId
            }
          ]);

        // Crear categoría por defecto
        await supabase
          .from('store_categories')
          .insert([
            {
              store_id: storeId,
              name: 'General',
              description: 'Categoría general',
              order_index: 1
            }
          ]);

        set({ 
          user: authData.user, 
          storeId: storeId,
          loading: false, 
          error: null 
        });
        
        return true;
      }

      // Si la tienda existe, usamos sus datos
      set({ 
        user: authData.user, 
        storeId: storeData.id,
        loading: false, 
        error: null 
      });
      
      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al iniciar sesión',
        loading: false,
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
        // Si hay sesión, obtenemos el storeId
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_email', session.user.email)
          .single();

        if (storeError) {
          // Si no existe la tienda, la creamos
          const storeName = session.user.email.split('@')[0];
          const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const storeId = `store_${Date.now()}`;

          const { error: createError } = await supabase
            .from('stores')
            .insert([
              {
                id: storeId,
                name: storeName,
                slug: storeSlug,
                owner_id: session.user.id,
                owner_name: storeName,
                owner_email: session.user.email,
                trial_start_date: new Date().toISOString(),
                subscription_status: 'trial',
                status: 'active'
              }
            ]);

          if (createError) {
            set({ 
              error: 'Error al crear la tienda', 
              loading: false,
              user: null,
              storeId: null 
            });
            return;
          }

          set({ 
            user: session.user,
            storeId: storeId,
            loading: false,
            error: null 
          });
          return;
        }
          
        set({ 
          user: session.user,
          storeId: storeData.id,
          loading: false,
          error: null 
        });
      } else {
        set({ user: null, storeId: null, loading: false, error: null });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al verificar la autenticación',
        loading: false,
        user: null,
        storeId: null,
      });
    }
  },
}));