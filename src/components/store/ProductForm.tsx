import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Camera, X, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from "react-toastify";
import { createProduct, updateProduct, getMeasurementUnits } from "../../services/products";
import { uploadImage } from '../../services/imageUpload';
import type { Database } from '../../lib/database.types';
import { useCategories } from "../../hooks/useCategories";

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
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      baseUnit: 'kg',
      presentations: product?.presentations?.map(p => ({
        id: p.id,
        unitId: p.unit_id,
        quantity: p.quantity,
        price: p.price,
        stock: p.stock || 0,
        isDefault: p.is_default,
      })) || [],
      imageUrl: product?.image_url || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'presentations',
  });

  const baseUnit = watch('baseUnit');
  const basePrice = watch('basePrice');

  // Cleanup effect for camera stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    if (baseUnit && units.length > 0) {
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
          price: basePrice || 0,
          stock: 0,
          isDefault: true,
        });
      }
    }
  }, [baseUnit, units, basePrice, append, setValue]);

  useEffect(() => {
    if (basePrice && fields.length > 0) {
      const updatedPresentations = fields.map((field) => {
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
  }, [basePrice, fields, setValue]);

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

  const loadUnits = async () => {
    try {
      const unitsData = await getMeasurementUnits();
      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading units:', error);
      toast.error('Error al cargar las unidades de medida');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Validaciones
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecciona una imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

      // Subir la imagen a ImgBB
      const { url: imageUrl } = await uploadImage(file);
      
      // Actualizar estado local
      setImagePreview(imageUrl);
      setValue('imageUrl', imageUrl);
      
      toast.success('Imagen actualizada con éxito');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error('Error al actualizar la imagen');
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Error al acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convertir a blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
      );
      
      // Crear archivo
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      
      // Subir imagen
      await handleImageUpload(file);
      
      // Detener la cámara
      stopCamera();
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Error al capturar la imagen');
    }
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
            salePrice: p.price,
            status: 'active'
          }))
        });
        toast.success('Producto actualizado correctamente');
      } else {
        const productInput = {
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
            salePrice: p.price
          }))
        };

        await createProduct(productInput);
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
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del Producto
              </label>
              <div className="flex flex-col items-center space-y-4">
                {/* Preview de la imagen */}
                <div className="relative w-48 h-48 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {isCapturing ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        <button
                          type="button"
                          onClick={captureImage}
                          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                        >
                          <Camera className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Vista previa del producto"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                {/* Botones de carga */}
                <div className="flex space-x-4">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={uploading || isCapturing}
                    />
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Imagen
                  </label>

                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={uploading || isCapturing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Tomar Foto
                  </button>
                </div>

                <p className="text-sm text-gray-500">
                  Formatos: PNG, JPG, WebP (máx. 5MB)
                </p>
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
