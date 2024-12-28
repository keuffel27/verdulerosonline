import { supabase } from '../lib/supabase';
import type { Category } from '../types/store';

export async function getCategories(storeId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('store_categories')
    .select('*')
    .eq('store_id', storeId)
    .order('order_index');

  if (error) throw error;
  return data;
}

export async function createCategory(storeId: string, category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const { data, error } = await supabase
    .from('store_categories')
    .insert([{ ...category, store_id: storeId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(categoryId: string, category: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase
    .from('store_categories')
    .update(category)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase
    .from('store_categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
}

export async function updateCategoriesOrder(categories: { id: string; order_index: number }[]): Promise<void> {
  // Actualizar cada categoría individualmente para asegurar la actualización
  const promises = categories.map(({ id, order_index }) => 
    supabase
      .from('store_categories')
      .update({ order_index })
      .eq('id', id)
  );

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('Error updating categories order:', error);
    throw error;
  }
}
