import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlot {
  open: string;
  close: string;
}

interface DaySchedule {
  isOpen: boolean;
  morning: TimeSlot;
  afternoon: TimeSlot;
}

interface Schedule {
  [key: string]: DaySchedule;
}

interface Props {
  storeId: string;
  onScheduleUpdate?: () => void;
}

export const StoreScheduleEditor: React.FC<Props> = ({ storeId, onScheduleUpdate }) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchSchedule();
  }, [storeId]);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('store_schedule')
        .select('schedule')
        .eq('store_id', storeId)
        .single();

      if (error) throw error;
      setSchedule(data?.schedule || null);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = async (day: string) => {
    if (!schedule) return;
    
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        isOpen: !schedule[day].isOpen
      }
    };

    try {
      const { error } = await supabase
        .from('store_schedule')
        .upsert({
          store_id: storeId,
          schedule: newSchedule
        });

      if (error) throw error;
      setSchedule(newSchedule);
      if (onScheduleUpdate) onScheduleUpdate();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleTimeChange = async (
    day: string,
    period: 'morning' | 'afternoon',
    type: 'open' | 'close',
    value: string
  ) => {
    if (!schedule) return;

    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [period]: {
          ...schedule[day][period],
          [type]: value
        }
      }
    };

    try {
      const { error } = await supabase
        .from('store_schedule')
        .upsert({
          store_id: storeId,
          schedule: newSchedule
        });

      if (error) throw error;
      setSchedule(newSchedule);
      if (onScheduleUpdate) onScheduleUpdate();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  if (loading) return <div>Cargando horarios...</div>;

  if (!schedule) return <div>No se encontró el horario</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Horario de la tienda</h2>
      {days.map((day) => (
        <div key={day} className="border p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium capitalize">
              {format(new Date(2024, 0, days.indexOf(day) + 1), 'EEEE', { locale: es })}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={schedule[day].isOpen}
                onChange={() => handleToggleDay(day)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {schedule[day].isOpen && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Mañana</p>
                <div className="flex space-x-2">
                  <input
                    type="time"
                    value={schedule[day].morning.open}
                    onChange={(e) => handleTimeChange(day, 'morning', 'open', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <span>a</span>
                  <input
                    type="time"
                    value={schedule[day].morning.close}
                    onChange={(e) => handleTimeChange(day, 'morning', 'close', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Tarde</p>
                <div className="flex space-x-2">
                  <input
                    type="time"
                    value={schedule[day].afternoon.open}
                    onChange={(e) => handleTimeChange(day, 'afternoon', 'open', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <span>a</span>
                  <input
                    type="time"
                    value={schedule[day].afternoon.close}
                    onChange={(e) => handleTimeChange(day, 'afternoon', 'close', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
