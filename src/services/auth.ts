import { supabase } from '../lib/supabase';

interface CreateStoreOwnerParams {
  email: string;
  password: string;
  name: string;
}

export async function createStoreOwner({ email, password, name }: CreateStoreOwnerParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'store_owner',
      },
    },
  });

  if (error) {
    console.error('Error creating store owner:', error);
    throw new Error('Error al crear el usuario: ' + error.message);
  }

  if (!data.user) {
    throw new Error('No se pudo crear la cuenta de usuario');
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error('Error al iniciar sesión: ' + error.message);
  }

  return data;
}