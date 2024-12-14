import { supabase } from '../lib/supabase';

export const storeOwnerLogin = async (userId: string, password: string, storeId: string) => {
  try {
    // Primero buscamos el email asociado al user_id
    const { data: userData, error: userError } = await supabase
      .from('store_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('ID de usuario no encontrado');
    }

    // Autenticamos usando el email temporal
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${userData.id}@store.local`,
      password
    });

    if (authError) {
      throw new Error('ID de usuario o contraseña incorrectos');
    }

    if (!authData.user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificamos que el usuario sea el dueño de la tienda
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single();

    if (storeError || !storeData) {
      throw new Error('Tienda no encontrada');
    }

    if (storeData.owner_id !== authData.user.id) {
      throw new Error('No tienes permiso para administrar esta tienda');
    }

    return authData;
  } catch (error) {
    console.error('Error en storeOwnerLogin:', error);
    throw error;
  }
};

export const createStoreOwner = async (userId: string, password: string) => {
  try {
    // Creamos el usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${userId}@store.local`,
      password,
      options: {
        data: {
          role: 'store_owner'
        }
      }
    });

    if (authError || !authData.user) {
      throw new Error('Error al crear el usuario');
    }

    // Guardamos el user_id personalizado
    const { error: userError } = await supabase
      .from('store_users')
      .insert([
        {
          id: authData.user.id,
          user_id: userId
        }
      ]);

    if (userError) {
      throw new Error('Error al guardar el ID de usuario personalizado');
    }

    // Iniciamos sesión automáticamente
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${userId}@store.local`,
      password
    });

    if (signInError) {
      throw signInError;
    }

    return signInData;
  } catch (error) {
    console.error('Error en createStoreOwner:', error);
    throw error;
  }
};

export const isStoreOwner = async (userId: string, storeId: string) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single();

    if (error) {
      console.error('Error al verificar dueño de tienda:', error);
      return false;
    }

    if (!data) {
      console.error('No se encontró la tienda al verificar dueño');
      return false;
    }

    return data.owner_id === userId;
  } catch (error) {
    console.error('Error en isStoreOwner:', error);
    return false;
  }
};
