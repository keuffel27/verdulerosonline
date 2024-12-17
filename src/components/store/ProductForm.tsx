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
          description: data.description,
          categoryId: data.categoryId,
          basePrice: data.basePrice,
          baseUnit: data.baseUnit,
          presentations: data.presentations,
          imageUrl: data.imageUrl,
        });
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct({
          storeId,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          basePrice: data.basePrice,
          baseUnit: data.baseUnit,
          presentations: data.presentations,
          imageUrl: data.imageUrl,
        });
        toast.success('Producto creado correctamente');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl transform transition-all ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Modal Header */}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Grid para campos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre del producto */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Categoría y Descripción */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  {...register('categoryId')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Imagen del producto */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Producto
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
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
                    ) : isCapturing ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={webcamRef}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleCapture}
                          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                        >
                          <Camera className="w-4 h-4" />
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
                  
                  <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Subir imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCapturing(!isCapturing)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isCapturing ? 'Cancelar' : 'Tomar foto'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Unidad de medida y Precio Base */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unidad de Medida Base
                  </label>
                  <select
                    {...register('baseUnit')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'kg') setSelectedSystem('metric');
                      else if (value === 'lb') setSelectedSystem('imperial');
                      else if (value === 'unit') setSelectedSystem('unit');
                      register('baseUnit').onChange(e);
                    }}
                  >
                    <option value="">Seleccionar unidad</option>
                    <option value="kg">Kilogramos (KG)</option>
                    <option value="lb">Libras (LB)</option>
                    <option value="unit">Unidad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio Base
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.basePrice.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Presentaciones */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presentaciones Disponibles
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {presentationOptions.map((presentation) => {
                    const isSelected = watch('presentations')?.some(
                      (p) => p.quantity === presentation.value
                    );

                    return (
                      <button
                        key={presentation.value}
                        type="button"
                        onClick={() => {
                          const presentations = watch('presentations') || [];
                          const exists = presentations.some(
                            (p) => p.quantity === presentation.value
                          );

                          if (exists) {
                            const index = presentations.findIndex(
                              (p) => p.quantity === presentation.value
                            );
                            remove(index);
                          } else {
                            const unit = selectedSystem === 'metric'
                              ? units.find((u) => u.symbol === 'g')
                              : selectedSystem === 'imperial'
                              ? units.find((u) => u.symbol === 'lb')
                              : units.find((u) => u.symbol === 'unit');

                            if (unit) {
                              append({
                                unitId: unit.id,
                                quantity: presentation.value,
                                price: 0,
                                stock: 0,
                                isDefault: presentations.length === 0,
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
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Botones del modal */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 -mx-6 -mb-6">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
