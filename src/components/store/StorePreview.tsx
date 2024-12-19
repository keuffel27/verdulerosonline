import React from 'react';
import { Store } from '../../types/store';
import { StoreAppearance } from '../../types/store';

interface StorePreviewProps {
  store: Store;
  appearance?: StoreAppearance | null;
  isVisible: boolean;
  isExpanded: boolean;
  onToggleVisibility: () => void;
  onToggleExpand: () => void;
}

export const StorePreview: React.FC<StorePreviewProps> = ({
  store,
  appearance,
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

        {/* Preview */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white h-full transition-all duration-300 shadow-lg w-full rounded-lg">
            <div className="flex flex-col h-full bg-white">
              {/* Banner */}
              <div className="relative w-full h-48 bg-gray-100">
                {appearance?.banner_url ? (
                  <img
                    src={appearance.banner_url}
                    alt="Banner de la tienda"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Sin banner</span>
                  </div>
                )}
              </div>

              {/* Logo y Nombre */}
              <div className="relative px-6">
                <div className="absolute -top-16 left-6">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-white shadow-lg border-4 border-white">
                    {appearance?.logo_url ? (
                      <img
                        src={appearance.logo_url}
                        alt={`Logo de ${store.name}`}
                        className="w-full h-full object-contain bg-white"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <span className="text-gray-400">Sin logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de la tienda */}
              <div className="mt-20 px-6 pb-6">
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                {appearance?.welcome_text && (
                  <p className="mt-2 text-gray-600">{appearance.welcome_text}</p>
                )}
                {appearance?.store_address && (
                  <p className="mt-2 text-sm text-gray-500">{appearance.store_address}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
