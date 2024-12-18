import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnqzqxqgmtxvdkxqjqzl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestCategory() {
  const storeId = process.argv[2];
  
  if (!storeId) {
    console.error('Store ID is required as first argument');
    process.exit(1);
  }

  try {
    const { data, error } = await supabase
      .from('store_categories')
      .insert([{
        store_id: storeId,
        name: 'Frutas y Verduras',
        description: 'Productos frescos del día',
        order_index: 0
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('Category created successfully:', data);
  } catch (error) {
    console.error('Error creating category:', error);
  }
}

createTestCategory();
