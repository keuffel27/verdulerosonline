import { supabase } from '../lib/supabase';
import { nanoid } from 'nanoid';
import type { Database } from '../lib/database.types';

type Store = Database['public']['Tables']['stores']['Row'];
type StoreInsert = Database['public']['Tables']['stores']['Insert'];

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreError';
  }
}

export async function createStore(storeData: {
  name: string;
  ownerName: string;
  email: string;
  password: string;
}): Promise<Store> {
  // Primero creamos el usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: storeData.email,
    password: storeData.password,
    options: {
      data: {
        role: 'store_owner',
        name: storeData.ownerName
      }
    }
  });

  if (authError) {
    console.error('Error creating user:', authError);
    throw new StoreError('Error al crear el usuario: ' + authError.message);
  }

  if (!authData.user) {
    throw new StoreError('No se pudo crear el usuario en Supabase Auth');
  }

  const slug = storeData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Verificar si el usuario ya tiene una tienda
  const { data: existingStore, error: existingStoreError } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', authData.user.id)
    .single();

  if (existingStoreError && existingStoreError.code !== 'PGRST116') {
    console.error('Error checking existing store:', existingStoreError);
    throw new StoreError(`Error al verificar tienda existente: ${existingStoreError.message}`);
  }

  if (existingStore) {
    throw new StoreError('Este usuario ya tiene una tienda registrada');
  }

  const storeInsert: StoreInsert = {
    id: nanoid(),
    name: storeData.name,
    slug,
    owner_name: storeData.ownerName,
    owner_id: authData.user.id,
    owner_email: storeData.email,
    trial_start_date: new Date().toISOString(),
    subscription_status: 'trial',
    status: 'active'
  };

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert([storeInsert])
    .select()
    .single();

  if (storeError) {
    console.error('Error creating store:', storeError);
    throw new StoreError('Error al crear la tienda: ' + storeError.message);
  }

  if (!store) {
    throw new StoreError('No se pudo crear la tienda');
  }

  return store;
}

export async function getStores() {
  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stores:', error);
    throw new StoreError('Error al obtener las tiendas: ' + error.message);
  }

  return stores || [];
}

export async function getStoreByEmail(email: string): Promise<Store> {
  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new StoreError('No se encontró una tienda asociada a este email');
    }
    console.error('Error fetching store:', error);
    throw new StoreError('Error al obtener la tienda: ' + error.message);
  }

  if (!store) {
    throw new StoreError('No se encontró una tienda asociada a este email');
  }

  return store;
}

export async function getStoreById(id: string): Promise<Store> {
  if (!id) {
    throw new StoreError('No se especificó un ID de tienda');
  }

  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new StoreError('No se encontró la tienda especificada');
    }
    console.error('Error fetching store:', error);
    throw new StoreError('Error al obtener la tienda: ' + error.message);
  }

  if (!store) {
    throw new StoreError('No se encontró la tienda especificada');
  }

  return store;
}

export async function updateStore(id: string, data: Partial<Store>) {
  const { data: store, error } = await supabase
    .from('stores')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating store:', error);
    throw new StoreError('Error al actualizar la tienda: ' + error.message);
  }

  return store;
}