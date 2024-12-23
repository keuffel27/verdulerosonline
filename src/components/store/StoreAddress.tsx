import { MapPin } from 'lucide-react';
import type { Store } from '../../types/store';

interface Props {
  store: Store;
  isOpen: boolean;
}

export const StoreAddress = ({ store, isOpen }: Props) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-lg px-6 py-2 flex items-center space-x-4">
        <div className={`flex items-center ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isOpen ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="font-medium">{isOpen ? 'Abierto' : 'Cerrado'}</span>
        </div>
        
        {store.address && (
          <>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{store.address}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
