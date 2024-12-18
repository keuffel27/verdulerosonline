import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface Props {
  quantity: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
}

export const ProductQuantitySelector: React.FC<Props> = ({
  quantity,
  onChange,
  max,
  disabled = false,
}) => {
  const handleChange = (value: number) => {
    if (disabled) return;
    if (value < 1) return;
    if (max !== undefined && value > max) return;
    onChange(value);
  };

  return (
    <div className="flex items-center space-x-1">
      <button
        type="button"
        onClick={() => handleChange(quantity - 1)}
        disabled={disabled || quantity <= 1}
        className={`p-1 rounded-md transition-colors ${
          disabled || quantity <= 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        type="number"
        min="1"
        max={max}
        value={quantity}
        onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
        disabled={disabled}
        className={`w-12 text-center rounded border ${
          disabled
            ? 'border-gray-200 bg-gray-50 text-gray-400'
            : 'border-gray-300 text-gray-900'
        }`}
      />

      <button
        type="button"
        onClick={() => handleChange(quantity + 1)}
        disabled={disabled || (max !== undefined && quantity >= max)}
        className={`p-1 rounded-md transition-colors ${
          disabled || (max !== undefined && quantity >= max)
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
