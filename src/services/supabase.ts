import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in .env file');
}

// Configuración del cliente con manejo robusto de sesión
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'verduleros-auth-token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'verduleros-online'
    }
  }
});

// Configurar el intervalo de renovación del token (cada 4 horas)
setInterval(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Error al renovar sesión:', error);
      // Intentar reconectar si hay error
      await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: localStorage.getItem('temp-pwd') || ''
      });
    }
  }
}, 4 * 60 * 60 * 1000); // 4 horas

// Manejar cambios en la sesión
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
    // Guardar la sesión actualizada
    localStorage.setItem('verduleros-session', JSON.stringify(session));
  } else if (event === 'SIGNED_OUT') {
    // Limpiar datos de sesión
    localStorage.removeItem('verduleros-session');
    localStorage.removeItem('temp-pwd');
  }
});
