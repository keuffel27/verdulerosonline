import { MapPin, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Store } from '../../types/store';
import { getStoreSchedule, isStoreOpen } from '../../services/schedule';

interface Props {
  store: Store;
}

export const StoreAddress = ({ store }: Props) => {
  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean; nextChange: string }>({ isOpen: false, nextChange: '' });

  useEffect(() => {
    const loadScheduleAndStatus = async () => {
      try {
        const schedule = await getStoreSchedule(store.id);
        const status = isStoreOpen(schedule);
        setStoreStatus(status);

        // Actualizar cada minuto
        const interval = setInterval(() => {
          const newStatus = isStoreOpen(schedule);
          setStoreStatus(newStatus);
        }, 60000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };

    loadScheduleAndStatus();
  }, [store.id]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-lg px-6 py-2 flex items-center space-x-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
          storeStatus.isOpen
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {storeStatus.isOpen ? 'Abierto' : 'Cerrado'} - {storeStatus.nextChange}
          </span>
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
