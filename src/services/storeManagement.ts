import { createStoreOwner } from './auth';
import { createStore } from './stores';
import { slugify } from '../utils/slugify';

interface CreateStoreData {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

interface StoreCredentials {
  storeUrl: string;
  adminUrl: string;
  email: string;
  password: string;
}

export async function createNewStore(data: CreateStoreData): Promise<StoreCredentials> {
  try {
    // 1. Create store owner account
    const { user } = await createStoreOwner({
      email: data.ownerEmail,
      password: data.ownerPassword,
      name: data.ownerName,
    });

    if (!user?.id) {
      throw new Error('No se pudo crear la cuenta del usuario');
    }

    // 2. Create store
    const storeSlug = slugify(data.name);
    const store = await createStore({
      name: data.name,
      slug: storeSlug,
      owner_id: user.id,
      status: 'active',
    });

    if (!store) {
      throw new Error('No se pudo crear la tienda');
    }

    // 3. Return credentials
    const baseUrl = window.location.origin;
    return {
      storeUrl: `${baseUrl}/store/${storeSlug}`,
      adminUrl: `${baseUrl}/store/${storeSlug}/panel`,
      email: data.ownerEmail,
      password: data.ownerPassword,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`Error al crear la tienda: ${message}`);
  }
}