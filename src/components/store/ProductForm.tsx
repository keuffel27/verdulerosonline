import { useState, useEffect } from 'react';
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
  presentations: Array<{
    id?: string;
    unitId: string;
    quantity: number;
    price: number;
    salePrice?: number;
    stock: number;
    isDefault: boolean;
  }>;
}

interface Props {
  storeId: string;
  product?: Product & { presentations: (ProductPresentation & { unit: MeasurementUnit })[] };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProductForm: React.FC<Props> = ({
  storeId,
  product,
  onSuccess,
  onCancel,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  
  const { categories } = useCategories(storeId);
  const { webcamRef, photoRef, startCamera, stopCamera, takePhoto } = useWebcam();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      categoryId: product?.category_id || '',
      presentations: product?.presentations?.map(p => ({
        id: p.id,
        unitId: p.unit_id,
        quantity: p.quantity,
        price: p.price,
        salePrice: p.sale_price || undefined,
        stock: p.stock,
        isDefault: p.is_default,
      })) || [
        {
          unitId: '',
          quantity: 1,
          price: 0,
          stock: 0,
          isDefault: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'presentations',
  });

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const unitsData = await getMeasurementUnits();
      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading units:', error);
      toast.error('Error al cargar las unidades de medida');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleCameraCapture = async () => {
    const photo = await takePhoto();
    if (photo) {
      setImageFile(photo);
      setImageUrl(URL.createObjectURL(photo));
      stopCamera();
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile);
      }

      if (product) {
        await updateProduct({
          id: product.id,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          imageUrl: finalImageUrl,
          presentations: data.presentations,
        });
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct({
          storeId,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          imageUrl: finalImageUrl,
          presentations: data.presentations,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Imagen del producto */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imagen del producto
        </label>
        <div className="flex gap-4">
          <div className="relative h-32 w-32 bg-gray-100 rounded-lg overflow-hidden">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl(null);
                    setImageFile(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Plus className="h-8 w-8 text-gray-400" />
                </label>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Camera size={20} />
            Usar cámara
          </button>
        </div>
        {webcamRef && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">
              <video ref={webcamRef} className="rounded-lg" />
              <canvas ref={photoRef} className="hidden" />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Capturar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información básica */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            {...register('name', { required: 'El nombre es requerido' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Categoría
          </label>
          <select
            {...register('categoryId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sin categoría</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Presentaciones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Presentaciones</h3>
          <button
            type="button"
            onClick={() =>
              append({
                unitId: '',
                quantity: 1,
                price: 0,
                stock: 0,
                isDefault: false,
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Plus size={20} />
            Agregar presentación
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Presentación {index + 1}</h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unidad
                  </label>
                  <select
                    {...register(`presentations.${index}.unitId` as const, {
                      required: 'La unidad es requerida',
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar unidad</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`presentations.${index}.quantity` as const, {
                      required: 'La cantidad es requerida',
                      min: { value: 0.01, message: 'La cantidad debe ser mayor a 0' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`presentations.${index}.price` as const, {
                      required: 'El precio es requerido',
                      min: { value: 0, message: 'El precio debe ser mayor o igual a 0' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio de oferta
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`presentations.${index}.salePrice` as const, {
                      min: { value: 0, message: 'El precio de oferta debe ser mayor o igual a 0' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    {...register(`presentations.${index}.stock` as const, {
                      required: 'El stock es requerido',
                      min: { value: 0, message: 'El stock debe ser mayor o igual a 0' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(`presentations.${index}.isDefault` as const)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Presentación por defecto
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};
