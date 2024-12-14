import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface Props {
  price: number;
  unitType: 'kg' | 'lb';
  minQuantity?: number;
  maxQuantity?: number | null;
  quantityStep?: number;
  onQuantityChange: (quantity: number, totalPrice: number) => void;
}

export const ProductQuantitySelector: React.FC<Props> = ({
  price,
  unitType,
  minQuantity = 0.1,
  maxQuantity = null,
  quantityStep = 0.1,
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState(minQuantity);
  const [displayUnit, setDisplayUnit] = useState<'kg' | 'lb' | 'g'>(unitType);

  // Convertir la cantidad a la unidad de display
  const getDisplayQuantity = (qty: number): number => {
    if (displayUnit === 'g' && (unitType === 'kg' || unitType === 'lb')) {
      return qty * (unitType === 'kg' ? 1000 : 453.592);
    }
    if (displayUnit === 'lb' && unitType === 'kg') {
      return qty * 2.20462;
    }
    if (displayUnit === 'kg' && unitType === 'lb') {
      return qty * 0.453592;
    }
    return qty;
  };

  // Convertir la cantidad de display a la unidad base
  const getBaseQuantity = (displayQty: number): number => {
    if (displayUnit === 'g' && (unitType === 'kg' || unitType === 'lb')) {
      return displayQty / (unitType === 'kg' ? 1000 : 453.592);
    }
    if (displayUnit === 'lb' && unitType === 'kg') {
      return displayQty * 0.453592;
    }
    if (displayUnit === 'kg' && unitType === 'lb') {
      return displayQty * 2.20462;
    }
    return displayQty;
  };

  const handleQuantityChange = (newQuantity: number) => {
    const baseQty = getBaseQuantity(newQuantity);
    if (baseQty >= minQuantity && (!maxQuantity || baseQty <= maxQuantity)) {
      setQuantity(baseQty);
      const totalPrice = baseQty * price;
      onQuantityChange(baseQty, totalPrice);
    }
  };

  const toggleUnit = () => {
    if (displayUnit === 'kg') {
      setDisplayUnit('g');
    } else if (displayUnit === 'g') {
      setDisplayUnit(unitType === 'kg' ? 'kg' : 'lb');
    } else if (displayUnit === 'lb') {
      setDisplayUnit('g');
    }
  };

  const formatQuantity = (qty: number): string => {
    const displayQty = getDisplayQuantity(qty);
    return displayQty.toFixed(displayUnit === 'g' ? 0 : 3);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleQuantityChange(getDisplayQuantity(quantity) - getDisplayQuantity(quantityStep))}
        className="p-1 rounded-full hover:bg-gray-100"
        disabled={quantity <= minQuantity}
      >
        <Minus className="h-4 w-4" />
      </button>

      <div className="flex items-center space-x-1">
        <input
          type="number"
          value={formatQuantity(quantity)}
          onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
          className="w-20 text-center border rounded-md px-2 py-1"
          step={getDisplayQuantity(quantityStep)}
          min={getDisplayQuantity(minQuantity)}
          max={maxQuantity ? getDisplayQuantity(maxQuantity) : undefined}
        />
        <button
          onClick={toggleUnit}
          className="px-2 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {displayUnit}
        </button>
      </div>

      <button
        onClick={() => handleQuantityChange(getDisplayQuantity(quantity) + getDisplayQuantity(quantityStep))}
        className="p-1 rounded-full hover:bg-gray-100"
        disabled={maxQuantity ? quantity >= maxQuantity : false}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};
