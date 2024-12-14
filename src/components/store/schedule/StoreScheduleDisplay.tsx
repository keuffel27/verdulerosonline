import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { format, parse, isWithinInterval, set, addDays } from 'date-fns';
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
}

export const StoreScheduleDisplay: React.FC<Props> = ({ storeId }) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [storeStatus, setStoreStatus] = useState<{
    isOpen: boolean;
    nextChange: Date | null;
    message: string;
  }>({ isOpen: false, nextChange: null, message: '' });

  useEffect(() => {
    fetchSchedule();
  }, [storeId]);

  useEffect(() => {
    if (schedule) {
      updateStoreStatus();
      const interval = setInterval(updateStoreStatus, 60000); // Actualizar cada minuto
      return () => clearInterval(interval);
    }
  }, [schedule]);

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
    }
  };

  const parseTimeString = (timeStr: string, baseDate: Date) => {
    const [hours, minutes] = timeStr.split(':');
    return set(baseDate, { hours: parseInt(hours), minutes: parseInt(minutes), seconds: 0 });
  };

  const updateStoreStatus = () => {
    if (!schedule) return;

    const now = new Date();
    const currentDay = format(now, 'EEEE', { locale: es }).toLowerCase();
    const todaySchedule = schedule[currentDay];

    if (!todaySchedule.isOpen) {
      // Buscar el próximo día que esté abierto
      let nextOpenDay = now;
      let daysChecked = 0;
      let foundNextOpen = false;

      while (daysChecked < 7 && !foundNextOpen) {
        nextOpenDay = addDays(nextOpenDay, 1);
        const nextDayName = format(nextOpenDay, 'EEEE', { locale: es }).toLowerCase();
        if (schedule[nextDayName].isOpen) {
          foundNextOpen = true;
          const nextOpenTime = parseTimeString(schedule[nextDayName].morning.open, nextOpenDay);
          setStoreStatus({
            isOpen: false,
            nextChange: nextOpenTime,
            message: `Abre ${format(nextOpenTime, "EEEE 'a las' HH:mm", { locale: es })}`
          });
        }
        daysChecked++;
      }
      return;
    }

    const morningOpen = parseTimeString(todaySchedule.morning.open, now);
    const morningClose = parseTimeString(todaySchedule.morning.close, now);
    const afternoonOpen = parseTimeString(todaySchedule.afternoon.open, now);
    const afternoonClose = parseTimeString(todaySchedule.afternoon.close, now);

    // Verificar si estamos en el horario de la mañana
    if (isWithinInterval(now, { start: morningOpen, end: morningClose })) {
      setStoreStatus({
        isOpen: true,
        nextChange: morningClose,
        message: `Cierra a las ${format(morningClose, 'HH:mm')}`
      });
      return;
    }

    // Verificar si estamos en el horario de la tarde
    if (isWithinInterval(now, { start: afternoonOpen, end: afternoonClose })) {
      setStoreStatus({
        isOpen: true,
        nextChange: afternoonClose,
        message: `Cierra a las ${format(afternoonClose, 'HH:mm')}`
      });
      return;
    }

    // Si estamos entre el cierre de la mañana y la apertura de la tarde
    if (isWithinInterval(now, { start: morningClose, end: afternoonOpen })) {
      setStoreStatus({
        isOpen: false,
        nextChange: afternoonOpen,
        message: `Abre a las ${format(afternoonOpen, 'HH:mm')}`
      });
      return;
    }

    // Si estamos antes de la apertura de la mañana
    if (now < morningOpen) {
      setStoreStatus({
        isOpen: false,
        nextChange: morningOpen,
        message: `Abre a las ${format(morningOpen, 'HH:mm')}`
      });
      return;
    }

    // Si estamos después del cierre de la tarde
    if (now > afternoonClose) {
      // Buscar la próxima apertura
      const tomorrow = addDays(now, 1);
      const tomorrowDay = format(tomorrow, 'EEEE', { locale: es }).toLowerCase();
      if (schedule[tomorrowDay].isOpen) {
        const nextOpen = parseTimeString(schedule[tomorrowDay].morning.open, tomorrow);
        setStoreStatus({
          isOpen: false,
          nextChange: nextOpen,
          message: `Abre mañana a las ${format(nextOpen, 'HH:mm')}`
        });
      }
    }
  };

  if (!schedule) return null;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const currentDay = format(new Date(), 'EEEE', { locale: es }).toLowerCase();

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${storeStatus.isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
        <p className="text-lg font-semibold">
          {storeStatus.isOpen ? '¡Abierto!' : 'Cerrado'}
        </p>
        <p className="text-sm">{storeStatus.message}</p>
      </div>

      <div className="space-y-2">
        {days.map((day) => (
          <div 
            key={day} 
            className={`p-3 rounded-lg ${day === currentDay ? 'bg-blue-50' : ''} ${!schedule[day].isOpen ? 'opacity-50' : ''}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium capitalize">
                {format(new Date(2024, 0, days.indexOf(day) + 1), 'EEEE', { locale: es })}
              </span>
              {!schedule[day].isOpen ? (
                <span className="text-sm">Cerrado</span>
              ) : (
                <div className="text-sm">
                  <span>{schedule[day].morning.open} - {schedule[day].morning.close}</span>
                  <span className="mx-1">|</span>
                  <span>{schedule[day].afternoon.open} - {schedule[day].afternoon.close}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
