import { MapPin } from 'lucide-react';
import type { Store } from '../../types/store';

interface Props {
  store: Store;
}

export const StoreAddress = ({ store }: Props) => {
  if (!store || !store.address) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-lg px-6 py-2">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-1 text-green-600 animate-[glowingTitle_2s_ease-in-out_infinite]">
            {store.name}
          </h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{store.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
