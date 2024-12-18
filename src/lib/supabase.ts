import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

console.log('Inicializando Supabase con URL:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public'
  }
});

// Verificar la conexión y sesión
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  if (session) {
    console.log('Usuario autenticado:', session.user.email);
  }
});