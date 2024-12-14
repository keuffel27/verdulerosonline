import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import type { Product } from '../../types/store';
import { toast } from 'react-toastify';

interface AddToCartButtonProps {
  product: Product;
  onSuccess?: () => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('1kg');
  const [notes, setNotes] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      product,
      quantity,
      size: selectedSize,
      notes: notes.trim(),
    });
    setIsOpen(false);
    setQuantity(1);
    setSelectedSize('1kg');
    setNotes('');
    toast.success('¡Producto agregado al carrito!');
    onSuccess?.();
  };

  const sizes = [
    { value: '100gr', label: '100 gr' },
    { value: '250gr', label: '250 gr' },
    { value: '500gr', label: '500 gr' },
    { value: '1kg', label: '1 kg' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        Agregar al carrito
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cantidad
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tamaño
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedSize(value)}
              className={`rounded-md border px-3 py-2 text-sm ${
                selectedSize === value
                  ? 'border-green-600 bg-green-50 text-green-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notas especiales (opcional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          placeholder="Ej: Sin semillas, más maduro, etc."
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setIsOpen(false)}
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Agregar
        </button>
      </div>
    </div>
  );
};
