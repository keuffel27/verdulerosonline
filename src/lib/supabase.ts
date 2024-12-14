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
  }
});

// Verificar la conexión y sesión
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  if (session) {
    console.log('User authenticated:', session.user.id);
    // Guardar la sesión en localStorage
    window.localStorage.setItem('supabase.auth.token', session.access_token);
    window.localStorage.setItem('supabase.auth.user', JSON.stringify(session.user));
  } else {
    console.log('No session found');
    // Limpiar la sesión del localStorage
    window.localStorage.removeItem('supabase.auth.token');
    window.localStorage.removeItem('supabase.auth.user');
  }
});

// Función para verificar si hay una sesión activa
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  return session;
};

// Exportar tipos útiles
export type { Database };

export async function getServerSupabase() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}