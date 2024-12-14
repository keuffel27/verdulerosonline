import React, { useState } from 'react';
import { Maximize2, Minimize2, X, Smartphone, AlertCircle } from 'lucide-react';

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
  const [mobileView, setMobileView] = useState(false);
  const [error, setError] = useState(false);

  if (!isVisible) return null;

  // Asegurarnos de que la URL sea absoluta
  const previewUrl = `${window.location.origin}/store/${storeId}`;

  const handleIframeError = () => {
    setError(true);
  };

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
              onClick={() => setMobileView(!mobileView)}
              className={`p-2 transition-colors ${
                mobileView ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista móvil"
            >
              <Smartphone className="w-5 h-5" />
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
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
          <div
            className={`bg-white h-full transition-all duration-300 shadow-lg ${
              mobileView
                ? 'w-[375px] rounded-[2rem] overflow-hidden'
                : 'w-full rounded-lg'
            }`}
          >
            {error ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
                <AlertCircle className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se pudo cargar la vista previa</h3>
                <p className="text-center text-sm">
                  Intenta refrescar la página o verifica que la tienda esté correctamente configurada.
                </p>
                <button
                  onClick={() => setError(false)}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Vista previa de la tienda"
                sandbox="allow-same-origin allow-scripts allow-forms"
                onError={handleIframeError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
