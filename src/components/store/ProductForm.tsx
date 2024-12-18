import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Camera, X, Plus, Trash2 } from 'lucide-react';
import { toast } from "react-toastify";
import { createProduct, updateProduct, uploadProductImage, getMeasurementUnits } from "../../services/products";
import type { Database } from '../../lib/database.types';
import { useCategories } from "../../hooks/useCategories";
import { useWebcam } from "../../hooks/useWebcam";

type Product = Database['public']['Tables']['store_products']['Row'];
type ProductPresentation = Database['public']['Tables']['product_presentations']['Row'];
type MeasurementUnit = Database['public']['Tables']['measurement_units']['Row'];

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  baseUnit: string;
  presentations: Array<{
    id?: string;
    unitId: string;
    quantity: number;
    price: number;
    stock: number;
    isDefault: boolean;
  }>;
  imageUrl?: string;
}

interface Props {
  storeId: string;
  product?: Product & { presentations: (ProductPresentation & { unit: MeasurementUnit })[] };
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export const ProductForm: React.FC<Props> = ({
  storeId,
  product,
  onSuccess,
  onCancel,
  isOpen
}) => {
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<'metric' | 'imperial' | 'unit'>('metric');
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useWebcam();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getSystemPresentations = (system: 'metric' | 'imperial' | 'unit') => {
    switch (system) {
      case 'metric':
        return [
          { value: 100, display: '100g' },
          { value: 250, display: '250g' },
          { value: 500, display: '500g' },
          { value: 1000, display: '1Kg' }
        ];
      case 'imperial':
        return [
          { value: 250, display: '¼ Libra' },
          { value: 500, display: '½ Libra' },
          { value: 750, display: '¾ Libra' },
          { value: 1000, display: '1 Libra' }
        ];
      case 'unit':
        return [
          { value: 1, display: '1 Unidad' },
          { value: 6, display: '6 Unidades' },
          { value: 12, display: '12 Unidades' },
          { value: 24, display: '24 Unidades' }
        ];
    }
  };

  const presentationOptions = getSystemPresentations(selectedSystem);

  const { categories } = useCategories(storeId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      categoryId: product?.category_id || '',
      basePrice: 0,
      baseUnit: '',
      presentations: [],
      imageUrl: product?.image_url || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'presentations',
  });

  const baseUnit = watch('baseUnit');
  const basePrice = watch('basePrice');

  // Obtener las presentaciones basadas en la unidad base
  const getBasePresentations = () => {
    const unit = baseUnit;
    if (!unit) return [];

    switch (unit) {
      case 'kg':
        return [
          { value: 100, display: '100g', fraction: 0.1 },
          { value: 250, display: '250g', fraction: 0.25 },
          { value: 500, display: '500g', fraction: 0.5 },
          { value: 1000, display: '1Kg', fraction: 1 }
        ];
      case 'lb':
        return [
          { value: 250, display: '¼ Libra', fraction: 0.25 },
          { value: 500, display: '½ Libra', fraction: 0.5 },
          { value: 750, display: '¾ Libra', fraction: 0.75 },
          { value: 1000, display: '1 Libra', fraction: 1 }
        ];
      case 'unit':
        return [
          { value: 1, display: '1 Unidad', fraction: 1 },
          { value: 6, display: '6 Unidades', fraction: 6 },
          { value: 12, display: '12 Unidades', fraction: 12 },
          { value: 24, display: '24 Unidades', fraction: 24 }
        ];
      default:
        return [];
    }
  };

  // Efecto para actualizar las presentaciones cuando cambia la unidad base
  useEffect(() => {
    if (baseUnit) {
      const unit = units.find(u => 
        (baseUnit === 'kg' && u.symbol === 'g') ||
        (baseUnit === 'lb' && u.symbol === 'lb') ||
        (baseUnit === 'unit' && u.symbol === 'unit')
      );

      if (unit) {
        // Limpiar presentaciones anteriores
        setValue('presentations', []);
        
        // Agregar presentación base
        append({
          unitId: unit.id,
          quantity: baseUnit === 'kg' ? 1000 : 1,
          price: basePrice,
          isDefault: true,
        });
      }
    }
  }, [baseUnit]);

  // Efecto para actualizar los precios cuando cambia el precio base
  useEffect(() => {
    if (basePrice && fields.length > 0) {
      const updatedPresentations = fields.map((field, index) => {
        const presentation = getBasePresentations().find(p => p.value === field.quantity);
        if (presentation) {
          return {
            ...field,
            price: basePrice * presentation.fraction
          };
        }
        return field;
      });

      setValue('presentations', updatedPresentations);
    }
  }, [basePrice]);

  const loadUnits = async () => {
    try {
      const unitsData = await getMeasurementUnits();
      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading units:', error);
      toast.error('Error al cargar las unidades de medida');
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  if (units.length === 0) {
    return <div className="p-4">Cargando unidades de medida...</div>;
  }

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true);
      const imageUrl = await uploadProductImage(file);
      setImagePreview(imageUrl);
      setValue('imageUrl', imageUrl);
    } catch (error) {
      toast.error('Error al subir la imagen');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convertir base64 a File
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const file = new File([blob], 'webcam-photo.jpg', { type: 'image/jpeg' });
        await handleImageUpload(file);
      }
    }
    setIsCapturing(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      
      if (product) {
        await updateProduct({
          id: product.id,
          name: data.name,
          description: data.description || null,
          categoryId: data.categoryId || null,
          imageUrl: data.imageUrl || null,
          presentations: data.presentations.map(p => ({
            id: p.id,
            unitId: p.unitId,
            quantity: p.quantity,
            price: p.price,
            isDefault: p.isDefault ?? false,
            stock: p.stock ?? 0,
            salePrice: p.price, // Using the same price as salePrice by default
            status: 'active'
          })),
        });
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct({
          storeId,
          name: data.name,
          description: data.description || null,
          categoryId: data.categoryId || null,
          imageUrl: data.imageUrl || null,
          presentations: data.presentations.map(p => ({
            unitId: p.unitId,
            quantity: p.quantity,
            price: p.price,
            isDefault: p.isDefault ?? false,
            stock: p.stock ?? 0,
            salePrice: p.price, // Using the same price as salePrice by default
            status: 'active'
          })),
        });
        toast.success('Producto creado correctamente');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error instanceof Error) {
        toast.error(`Error al guardar el producto: ${error.message}`);
      } else {
        toast.error('Error al guardar el producto');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity ${isOpen ? 'opacity-50' : 'opacity-0'}`}
        onClick={onCancel}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl transform transition-all ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre y Categoría */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'El nombre es requerido' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  {...register('categoryId')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Sin categoría</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Unidad Base y Precio Base */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Unidad de Medida Base
                </label>
                <select
                  {...register('baseUnit', { required: 'La unidad base es requerida' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Seleccionar unidad</option>
                  <option value="kg">Kilogramos (KG)</option>
                  <option value="lb">Libras (LB)</option>
                  <option value="unit">Unidad</option>
                </select>
                {errors.baseUnit && (
                  <p className="mt-1 text-sm text-red-600">{errors.baseUnit.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio Base {baseUnit && `(${baseUnit === 'kg' ? '1 Kg' : baseUnit === 'lb' ? '1 Libra' : '1 Unidad'})`}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    {...register('basePrice', {
                      required: 'El precio base es requerido',
                      min: { value: 0, message: 'El precio debe ser mayor o igual a 0' },
                    })}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                {errors.basePrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>
                )}
              </div>
            </div>

            {/* Presentaciones */}
            {baseUnit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presentaciones Disponibles
                </label>
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const presentation = getBasePresentations().find(p => p.value === field.quantity);
                    return (
                      <div key={field.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-grow grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Cantidad
                            </label>
                            <input
                              type="text"
                              value={presentation?.display || ''}
                              readOnly
                              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Precio Sugerido: ${(basePrice * (presentation?.fraction || 0)).toFixed(2)}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                {...register(`presentations.${index}.price` as const, {
                                  required: 'El precio es requerido',
                                  min: { value: 0, message: 'El precio debe ser mayor o igual a 0' },
                                })}
                                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="flex-shrink-0 p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Agregar Presentaciones */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {getBasePresentations().map((presentation) => {
                    const isSelected = fields.some(
                      field => field.quantity === presentation.value
                    );

                    return (
                      <button
                        key={presentation.value}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            const index = fields.findIndex(
                              field => field.quantity === presentation.value
                            );
                            remove(index);
                          } else {
                            const unit = units.find(u => 
                              (baseUnit === 'kg' && u.symbol === 'g') ||
                              (baseUnit === 'lb' && u.symbol === 'lb') ||
                              (baseUnit === 'unit' && u.symbol === 'unit')
                            );

                            if (unit) {
                              append({
                                unitId: unit.id,
                                quantity: presentation.value,
                                price: basePrice * presentation.fraction,
                                isDefault: fields.length === 0,
                              });
                            }
                          }
                        }}
                        className={`
                          aspect-square flex flex-col items-center justify-center p-2
                          border rounded-lg transition-colors
                          ${
                            isSelected
                              ? 'bg-green-500 text-white border-green-600'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }
                        `}
                      >
                        <span className="text-sm font-medium text-center">
                          {presentation.display}
                        </span>
                        {!isSelected && (
                          <span className="text-xs text-gray-500 mt-1">
                            ${(basePrice * presentation.fraction).toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del Producto
              </label>
              <div className="flex items-start space-x-4">
                <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setValue('imageUrl', '');
                        }}
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-2">
                      <Plus className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 text-center mt-1">
                        Agregar imagen
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Subir imagen
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
