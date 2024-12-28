import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Loader2, Save, Sun, Moon, Calendar, Grip, Plus, Image as ImageIcon, Edit2, Trash2, FolderTree } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NewCategory {
  name: string;
  description: string;
  image: File | null;
}

interface SortableCategoryItemProps {
  category: Category;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableCategoryItem({ category, onEdit, onDelete }: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as const,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm 
                ${isDragging ? 'shadow-xl ring-2 ring-green-500' : ''}
                hover:shadow-md hover:border-green-200 transition-all duration-200`}
    >
      <div className="p-4 flex items-center space-x-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <Grip className="h-5 w-5 text-gray-400 hover:text-green-500 transition-colors" />
        </div>
        
        <div className="flex-shrink-0">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="h-12 w-12 rounded-lg object-cover shadow-sm"
            />
          ) : (
            <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg 
                         flex items-center justify-center hover:from-green-100 hover:to-emerald-100 transition-all duration-200">
              <ImageIcon className="h-6 w-6 text-gray-400 hover:text-green-500 transition-colors" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {category.name}
          </p>
          {category.description && (
            <p className="mt-1 text-sm text-gray-500">
              {category.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(category.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-100 transition-all duration-200"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition-all duration-200"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StoreCategories() {
  const { storeId } = useParams<{ storeId: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    description: '',
    image: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (storeId) {
      loadCategories();
    }
  }, [storeId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories(storeId!);
      // Ordenar las categorías por order_index antes de establecerlas
      const sortedData = [...data].sort((a, b) => 
        (a.order_index ?? 0) - (b.order_index ?? 0)
      );
      setCategories(sortedData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);
    
    // Actualizar inmediatamente el estado local para mejor UX
    const updatedCategories = arrayMove([...categories], oldIndex, newIndex);
    setCategories(updatedCategories);
    
    try {
      // Intentar actualizar en la base de datos
      await updateCategoriesOrder(
        updatedCategories.map((cat, index) => ({
          id: cat.id,
          order_index: index,
        }))
      );
      
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el orden');
      
      // En caso de error, revertir al estado anterior
      const originalCategories = await getCategories(storeId!);
      const sortedOriginalCategories = [...originalCategories].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      );
      setCategories(sortedOriginalCategories);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await deleteCategory(id);
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

  const handleEditCategory = (id: string) => {
    // Implementar la lógica para editar una categoría
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-green-500 border-t-transparent animate-spin mx-auto"></div>
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin absolute top-0 left-1/2 -translate-x-1/2" 
               style={{ animationDirection: 'reverse', opacity: 0.5 }}></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-5 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Calendar className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Categorías
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Organiza y gestiona las categorías de tu tienda. Arrastra para reordenar.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 md:mt-0 md:col-span-2 px-4 py-5 sm:p-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingCategory(true)}
              className="mb-6 inline-flex items-center px-4 py-2 rounded-xl shadow-lg text-sm font-medium text-white
                       bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Categoría
            </motion.button>

            {categories.length === 0 && !isAddingCategory ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay categorías creadas</p>
              </motion.div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categories.map(cat => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <SortableCategoryItem
                        key={category.id}
                        category={category}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <AnimatePresence>
              {isAddingCategory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 bg-white p-6 rounded-xl border border-gray-200 shadow-lg"
                >
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Nueva Categoría
                  </h4>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <textarea
                        value={newCategory.description}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Imagen
                      </label>
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {newCategory.image ? (
                            <img
                              src={URL.createObjectURL(newCategory.image)}
                              alt="Preview"
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <label className="relative cursor-pointer">
                          <span className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm
                                       ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            Cambiar
                          </span>
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategory({ name: '', description: '', image: null });
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100
                               hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                               transition-all duration-200"
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={savingCategory}
                        className="inline-flex items-center px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white
                               bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {savingCategory ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default StoreCategories;
