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
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  // Configuración para manejar timeouts y reintentos
  fetch: (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

    return fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache',
      },
    })
      .finally(() => clearTimeout(timeoutId))
      .catch(error => {
        if (error.name === 'AbortError') {
          throw new Error('La conexión ha excedido el tiempo de espera. Por favor, intenta nuevamente.');
        }
        throw error;
      });
  }
});

// Verificar la conexión y sesión
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  if (session) {
    console.log('User authenticated:', session.user.id);
    // Guardar la sesión en localStorage de manera segura
    try {
      window.localStorage.setItem('supabase.auth.token', session.access_token);
      window.localStorage.setItem('supabase.auth.user', JSON.stringify(session.user));
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
    }
  } else {
    console.log('No session found');
    // Limpiar la sesión del localStorage
    try {
      window.localStorage.removeItem('supabase.auth.token');
      window.localStorage.removeItem('supabase.auth.user');
    } catch (error) {
      console.error('Error removing session from localStorage:', error);
    }
  }
});

// Función para verificar si hay una sesión activa con manejo de errores mejorado
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error.message);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return null;
  }
};

// Función para verificar el estado de la conexión
export const checkConnection = async () => {
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('stores')
      .select('count')
      .limit(1)
      .single();
    
    const latency = Date.now() - start;
    console.log(`Supabase connection latency: ${latency}ms`);

    if (error) {
      console.error('Connection check error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

// Exportar tipos útiles
export type { Database };

export async function getServerSupabase() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}