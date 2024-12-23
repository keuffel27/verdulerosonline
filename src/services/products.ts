import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['store_products']['Row'];
type ProductPresentation = Database['public']['Tables']['product_presentations']['Row'];
type MeasurementUnit = Database['public']['Tables']['measurement_units']['Row'];
type Category = Database['public']['Tables']['store_categories']['Row'];

interface ProductWithPresentations extends Product {
  presentations: (ProductPresentation & { unit: MeasurementUnit })[];
  category?: Category | null;
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
    .eq('status', 'active')
    .order('created_at');

  if (error) throw error;

  // Filtrar productos que tienen presentaciones activas
  const productsWithActivePresentations = products?.filter(product => {
    const activePresentations = product.presentations?.filter(p => p.status === 'active') || [];
    // @ts-ignore - Ignorar error de tipo aquí ya que sabemos que la estructura es correcta
    product.presentations = activePresentations;
    return activePresentations.length > 0;
  }) || [];

  return productsWithActivePresentations as ProductWithPresentations[];
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

  if (error) return null;

  // Filtrar presentaciones activas
  if (product) {
    const activePresentations = product.presentations?.filter(p => p.status === 'active') || [];
    // @ts-ignore - Ignorar error de tipo aquí ya que sabemos que la estructura es correcta
    product.presentations = activePresentations;
  }

  return product as ProductWithPresentations;
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
  const { presentations, ...productData } = input;

  // Insertar producto
  const { data: product, error: productError } = await supabase
    .from('store_products')
    .insert({
      store_id: input.storeId,
      name: input.name,
      description: input.description,
      category_id: input.categoryId,
      image_url: input.imageUrl,
      status: 'active' as const,
    })
    .select()
    .single();

  if (productError || !product) throw productError;

  // Insertar presentaciones
  const presentationsData = presentations.map(p => ({
    product_id: product.id,
    unit_id: p.unitId,
    quantity: p.quantity,
    price: p.price,
    sale_price: p.salePrice,
    stock: p.stock ?? 0,
    is_default: p.isDefault ?? false,
    status: 'active' as const,
  }));

  const { data: createdPresentations, error: presentationsError } = await supabase
    .from('product_presentations')
    .insert(presentationsData)
    .select(`
      *,
      unit:measurement_units (*)
    `);

  if (presentationsError) throw presentationsError;

  return {
    ...product,
    presentations: createdPresentations,
  } as ProductWithPresentations;
};

interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string | null;
  categoryId?: string | null;
  imageUrl?: string | null;
  presentations?: Array<{
    id?: string;
    unitId: string;
    quantity: number;
    price: number;
    salePrice?: number | null;
    stock?: number;
    isDefault?: boolean;
  }>;
}

export const updateProduct = async (input: UpdateProductInput): Promise<ProductWithPresentations> => {
  const { presentations, ...productData } = input;

  // Actualizar producto
  const { data: updatedProduct, error: productError } = await supabase
    .from('store_products')
    .update({
      name: productData.name,
      description: productData.description,
      category_id: productData.categoryId,
      image_url: productData.imageUrl,
    })
    .eq('id', productData.id)
    .select()
    .single();

  if (productError || !updatedProduct) throw productError;

  if (presentations) {
    // Obtener presentaciones existentes
    const { data: existingPresentations } = await supabase
      .from('product_presentations')
      .select('id')
      .eq('product_id', productData.id);

    const existingIds = new Set(existingPresentations?.map(p => p.id) || []);
    const updatedIds = new Set(presentations.filter(p => p.id).map(p => p.id));

    // Eliminar presentaciones que ya no existen
    const idsToDelete = [...existingIds].filter(id => !updatedIds.has(id));
    if (idsToDelete.length > 0) {
      await supabase
        .from('product_presentations')
        .delete()
        .in('id', idsToDelete);
    }

    // Actualizar o insertar presentaciones
    for (const presentation of presentations) {
      const presentationData = {
        product_id: productData.id,
        unit_id: presentation.unitId,
        quantity: presentation.quantity,
        price: presentation.price,
        sale_price: presentation.salePrice,
        stock: presentation.stock ?? 0,
        is_default: presentation.isDefault ?? false,
        status: 'active' as const,
      };

      if (presentation.id) {
        await supabase
          .from('product_presentations')
          .update(presentationData)
          .eq('id', presentation.id);
      } else {
        await supabase
          .from('product_presentations')
          .insert(presentationData);
      }
    }
  }

  // Obtener producto actualizado con todas sus relaciones
  const { data: product } = await supabase
    .from('store_products')
    .select(`
      *,
      category:store_categories(*),
      presentations:product_presentations (
        *,
        unit:measurement_units (*)
      )
    `)
    .eq('id', productData.id)
    .single();

  return product as ProductWithPresentations;
};

export const deleteProduct = async (productId: string): Promise<void> => {
  // Marcar como inactivo en lugar de eliminar
  const { error } = await supabase
    .from('store_products')
    .update({ status: 'inactive' as const })
    .eq('id', productId);

  if (error) throw error;
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

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
    .order('name');

  if (error) throw error;

  return units;
};