import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['store_products']['Row'];
type ProductPresentation = Database['public']['Tables']['product_presentations']['Row'];
type MeasurementUnit = Database['public']['Tables']['measurement_units']['Row'];

interface ProductWithPresentations extends Product {
  presentations: (ProductPresentation & { unit: MeasurementUnit })[];
  category?: Database['public']['Tables']['store_categories']['Row'];
}

export const getProducts = async (storeId: string): Promise<ProductWithPresentations[]> => {
  const { data: products, error } = await supabase
    .from('store_products')
    .select(`
      *,
      category:store_categories(*),
      presentations:product_presentations (
        *,
        unit:measurement_units (*)
      )
    `)
    .eq('store_id', storeId)
    .order('created_at');

  if (error) throw error;
  return products || [];
};

export const getProductById = async (productId: string): Promise<ProductWithPresentations | null> => {
  const { data: product, error } = await supabase
    .from('store_products')
    .select(`
      *,
      category:store_categories(*),
      presentations:product_presentations (
        *,
        unit:measurement_units (*)
      )
    `)
    .eq('id', productId)
    .single();

  if (error) throw error;
  return product;
};

interface CreateProductInput {
  storeId: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  imageUrl?: string | null;
  presentations: Array<{
    unitId: string;
    quantity: number;
    price: number;
    salePrice?: number | null;
    stock?: number;
    isDefault?: boolean;
  }>;
}

export const createProduct = async (input: CreateProductInput): Promise<ProductWithPresentations> => {
  const { storeId, name, description, categoryId, imageUrl, presentations } = input;

  // Crear el producto
  const { data: product, error: productError } = await supabase
    .from('store_products')
    .insert({
      store_id: storeId,
      name,
      description,
      category_id: categoryId,
      image_url: imageUrl,
      status: 'active'
    })
    .select('*')
    .single();

  if (productError) {
    console.error('Error creating product:', productError);
    throw new Error(`Error al crear el producto: ${productError.message}`);
  }

  if (!product) {
    throw new Error('No se pudo crear el producto');
  }

  // Crear las presentaciones
  const presentationsToInsert = presentations.map(p => ({
    product_id: product.id,
    unit_id: p.unitId,
    quantity: p.quantity,
    price: p.price,
    sale_price: p.salePrice,
    stock: p.stock ?? 0,
    is_default: p.isDefault ?? false,
    status: 'active'
  }));

  const { error: presentationsError } = await supabase
    .from('product_presentations')
    .insert(presentationsToInsert);

  if (presentationsError) {
    // Si falla la creación de presentaciones, eliminamos el producto
    await supabase
      .from('store_products')
      .delete()
      .eq('id', product.id);
    
    throw new Error(`Error al crear las presentaciones: ${presentationsError.message}`);
  }

  // Obtener el producto completo con sus presentaciones
  const createdProduct = await getProductById(product.id);
  if (!createdProduct) {
    throw new Error('No se pudo obtener el producto creado');
  }

  return createdProduct;
};

interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  categoryId?: string;
  imageUrl?: string;
  presentations?: Array<{
    id?: string;
    unitId: string;
    quantity: number;
    price: number;
    salePrice?: number;
    stock?: number;
    isDefault?: boolean;
  }>;
}

export const updateProduct = async (input: UpdateProductInput): Promise<ProductWithPresentations> => {
  const { id, name, description, categoryId, imageUrl, presentations } = input;

  // Update product basic info
  if (name || description !== undefined || categoryId || imageUrl) {
    const { error: productError } = await supabase
      .from('store_products')
      .update({
        name,
        description,
        category_id: categoryId,
        image_url: imageUrl,
      })
      .eq('id', id);

    if (productError) throw productError;
  }

  // Update presentations if provided
  if (presentations) {
    // Get existing presentations
    const { data: existingPresentations } = await supabase
      .from('product_presentations')
      .select('id')
      .eq('product_id', id);

    const existingIds = new Set(existingPresentations?.map(p => p.id) || []);
    
    // Split presentations into updates and inserts
    const presentationsToUpdate = presentations.filter(p => p.id && existingIds.has(p.id));
    const presentationsToInsert = presentations.filter(p => !p.id);
    
    // Delete presentations that are no longer needed
    const presentationIdsToKeep = new Set(presentationsToUpdate.map(p => p.id));
    const presentationsToDelete = existingPresentations?.filter(p => !presentationIdsToKeep.has(p.id));
    
    if (presentationsToDelete?.length) {
      await supabase
        .from('product_presentations')
        .delete()
        .in('id', presentationsToDelete.map(p => p.id));
    }

    // Update existing presentations
    const updatePromises = presentationsToUpdate.map(presentation =>
      supabase
        .from('product_presentations')
        .update({
          unit_id: presentation.unitId,
          quantity: presentation.quantity,
          price: presentation.price,
          sale_price: presentation.salePrice,
          stock: presentation.stock,
          is_default: presentation.isDefault,
        })
        .eq('id', presentation.id)
    );

    // Insert new presentations
    const insertPromises = presentationsToInsert.map(presentation =>
      supabase
        .from('product_presentations')
        .insert({
          product_id: id,
          unit_id: presentation.unitId,
          quantity: presentation.quantity,
          price: presentation.price,
          sale_price: presentation.salePrice,
          stock: presentation.stock ?? 0,
          is_default: presentation.isDefault ?? false,
        })
    );

    await Promise.all([...updatePromises, ...insertPromises]);
  }

  return await getProductById(id);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const { error } = await supabase
    .from('store_products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('products').getPublicUrl(filePath);

  return data.publicUrl;
};

export const getMeasurementUnits = async (): Promise<MeasurementUnit[]> => {
  const { data: units, error } = await supabase
    .from('measurement_units')
    .select('*')
    .order('system', { ascending: true })
    .order('base_unit', { ascending: false });

  if (error) throw error;
  return units;
};