import React from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';

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

  return (
    <div
      className={`fixed right-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 z-50
        ${isExpanded ? 'w-full md:w-[60%]' : 'w-full md:w-[40%]'}`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Vista previa de la tienda</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleVisibility}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleExpand}
              className="hidden md:block p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={isExpanded ? 'Reducir' : 'Expandir'}
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Store Preview Iframe */}
        <div className="flex-1 relative">
          <iframe
            src={`/store/${storeId}`}
            className="w-full h-full border-none"
            title="Vista previa de la tienda"
          />
        </div>
      </div>
    </div>
  );
};
