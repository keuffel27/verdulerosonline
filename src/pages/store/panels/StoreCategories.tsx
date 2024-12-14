import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grip, Plus, Image as ImageIcon, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Category } from '../../../types/store';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoriesOrder,
} from '../../../services/categories';
import { supabase } from '../../../lib/supabase';

interface NewCategory {
  name: string;
  description: string;
  image: File | null;
}

function StoreCategories() {
  const { storeId } = useParams<{ storeId: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    description: '',
    image: null,
  });

  useEffect(() => {
    if (storeId) {
      loadCategories();
    }
  }, [storeId]);

  const loadCategories = async () => {
    try {
      const data = await getCategories(storeId!);
      setCategories(data);
    } catch (error) {
      toast.error('Error al cargar las categorías');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    setCategories(updatedItems);

    try {
      await updateCategoriesOrder(
        updatedItems.map(({ id, order_index }) => ({ id, order_index }))
      );
    } catch (error) {
      toast.error('Error al actualizar el orden');
      loadCategories(); // Recargar el orden original
    }
  };

  const handleAddCategory = async (): Promise<void> => {
    if (!newCategory.name || !storeId || savingCategory) return;

    setSavingCategory(true);
    try {
      let imageUrl = '';
      if (newCategory.image) {
        const fileName = `${Date.now()}-${newCategory.image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(fileName, newCategory.image);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('category-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      const categoryData = {
        name: newCategory.name,
        description: newCategory.description,
        image_url: imageUrl,
        order_index: categories.length,
        store_id: storeId,
      };

      await createCategory(storeId, categoryData);
      await loadCategories();
      
      setNewCategory({ name: '', description: '', image: null });
      setIsAddingCategory(false);
      toast.success('Categoría creada exitosamente');
    } catch (error) {
      toast.error('Error al crear la categoría');
      console.error(error);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await deleteCategory(categoryId);
      await loadCategories();
      toast.success('Categoría eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la categoría');
      console.error(error);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setNewCategory({ ...newCategory, image: e.target.files[0] });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Categorías
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Organiza tus productos en categorías y arrastra para reordenar.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Agregar Categoría
              </button>
            </div>
          </div>

          {isAddingCategory && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="description"
                      id="description"
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, description: e.target.value })
                      }
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                      id="category-image"
                    />
                    <label
                      htmlFor="category-image"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <ImageIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                      {newCategory.image ? 'Cambiar imagen' : 'Subir imagen'}
                    </label>
                    {newCategory.image && (
                      <span className="ml-2 text-sm text-gray-500">
                        {newCategory.image.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategory({ name: '', description: '', image: null });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategory.name || savingCategory}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {savingCategory ? (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  Guardar Categoría
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {categories.map((category, index) => (
                      <Draggable
                        key={category.id}
                        draggableId={category.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move"
                              >
                                <Grip className="h-5 w-5 text-gray-400" />
                              </div>
                              {category.image_url && (
                                <img
                                  src={category.image_url}
                                  alt={category.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </h4>
                                {category.description && (
                                  <p className="text-sm text-gray-500">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exportación por defecto del componente
export default StoreCategories;
