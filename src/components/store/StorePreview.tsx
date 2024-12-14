import React from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';

interface StorePreviewProps {
  storeId: string;
  isVisible: boolean;
  isExpanded: boolean;
  onToggleVisibility: () => void;
  onToggleExpand: () => void;
}

export const StorePreview: React.FC<StorePreviewProps> = ({
  storeId,
  isVisible,
  isExpanded,
  onToggleVisibility,
  onToggleExpand,
}) => {
  if (!isVisible) return null;

  const previewUrl = `/store/${storeId}`;

  return (
    <div
      className={`fixed right-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-[60%]' : 'w-[40%]'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Vista previa de la tienda</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleExpand}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={isExpanded ? 'Reducir' : 'Expandir'}
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onToggleVisibility}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Vista previa de la tienda"
          />
        </div>
      </div>
    </div>
  );
};
