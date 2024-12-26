import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { format, parse, isWithinInterval, set, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStoreSchedule } from '../../../services/schedule';

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
  compact?: boolean;
}

export const StoreScheduleDisplay: React.FC<Props> = ({ storeId, compact = false }) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [storeStatus, setStoreStatus] = useState<{
    isOpen: boolean;
    nextChange: Date | null;
    message: string;
  }>({ isOpen: false, nextChange: null, message: '' });

  useEffect(() => {
    console.log('StoreScheduleDisplay mounted with storeId:', storeId);
    fetchSchedule();
  }, [storeId]);

  useEffect(() => {
    if (schedule) {
      console.log('Schedule updated:', schedule);
      updateStoreStatus();
      const interval = setInterval(updateStoreStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [schedule]);

  const fetchSchedule = async () => {
    try {
      console.log('Fetching schedule for storeId:', storeId);
      const scheduleData = await getStoreSchedule(storeId);
      console.log('Received schedule data:', scheduleData);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const parseTimeString = (timeStr: string, baseDate: Date) => {
    const [hours, minutes] = timeStr.split(':');
    return set(baseDate, { hours: parseInt(hours), minutes: parseInt(minutes), seconds: 0 });
  };

  const updateStoreStatus = () => {
    if (!schedule) {
      console.log('No schedule available');
      return;
    }

    const now = new Date();
    console.log('Current time:', now);
    const currentDay = format(now, 'EEEE', { locale: es }).toLowerCase();
    console.log('Current day:', currentDay);
    const todaySchedule = schedule[currentDay];
    console.log('Today schedule:', todaySchedule);

    if (!todaySchedule?.isOpen) {
      console.log('Store is closed today');
      // Buscar el próximo día que esté abierto
      let nextOpenDay = now;
      let daysChecked = 0;
      let foundNextOpen = false;

      while (daysChecked < 7 && !foundNextOpen) {
        nextOpenDay = addDays(nextOpenDay, 1);
        const nextDayName = format(nextOpenDay, 'EEEE', { locale: es }).toLowerCase();
        console.log('Checking next day:', nextDayName);
        if (schedule[nextDayName]?.isOpen) {
          foundNextOpen = true;
          const nextOpenTime = parseTimeString(schedule[nextDayName].morning.open, nextOpenDay);
          const message = `Abre ${format(nextOpenTime, "EEEE 'a las' HH:mm", { locale: es })}`;
          console.log('Found next open day:', message);
          setStoreStatus({
            isOpen: false,
            nextChange: nextOpenTime,
            message
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

    console.log('Time ranges:', {
      morning: { open: morningOpen, close: morningClose },
      afternoon: { open: afternoonOpen, close: afternoonClose }
    });

    // Verificar si estamos en el horario de la mañana
    if (isWithinInterval(now, { start: morningOpen, end: morningClose })) {
      const message = `Cierra a las ${format(morningClose, 'HH:mm')}`;
      console.log('Store is open (morning):', message);
      setStoreStatus({
        isOpen: true,
        nextChange: morningClose,
        message
      });
      return;
    }

    // Verificar si estamos en el horario de la tarde
    if (isWithinInterval(now, { start: afternoonOpen, end: afternoonClose })) {
      const message = `Cierra a las ${format(afternoonClose, 'HH:mm')}`;
      console.log('Store is open (afternoon):', message);
      setStoreStatus({
        isOpen: true,
        nextChange: afternoonClose,
        message
      });
      return;
    }

    // Si estamos entre el cierre de la mañana y la apertura de la tarde
    if (now > morningClose && now < afternoonOpen) {
      const message = `Abre a las ${format(afternoonOpen, 'HH:mm')}`;
      console.log('Store is in break:', message);
      setStoreStatus({
        isOpen: false,
        nextChange: afternoonOpen,
        message
      });
      return;
    }

    // Si estamos antes de la apertura de la mañana
    if (now < morningOpen) {
      const message = `Abre a las ${format(morningOpen, 'HH:mm')}`;
      console.log('Store will open today:', message);
      setStoreStatus({
        isOpen: false,
        nextChange: morningOpen,
        message
      });
      return;
    }

    // Si estamos después del cierre de la tarde
    if (now > afternoonClose) {
      console.log('Store is closed for today');
      // Buscar la próxima apertura
      const tomorrow = addDays(now, 1);
      const tomorrowDay = format(tomorrow, 'EEEE', { locale: es }).toLowerCase();
      if (schedule[tomorrowDay]?.isOpen) {
        const nextOpen = parseTimeString(schedule[tomorrowDay].morning.open, tomorrow);
        const message = `Abre mañana a las ${format(nextOpen, 'HH:mm')}`;
        console.log('Next opening:', message);
        setStoreStatus({
          isOpen: false,
          nextChange: nextOpen,
          message
        });
      }
    }
  };

  if (!schedule) {
    console.log('Rendering: No schedule available');
    return null;
  }

  console.log('Rendering with status:', storeStatus);

  if (compact) {
    return (
      <div className={`flex items-center ${storeStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${
          storeStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium">
          {storeStatus.isOpen ? '¡Abierto!' : 'Cerrado'}{storeStatus.message ? ` • ${storeStatus.message}` : ''}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${storeStatus.isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
        <p className="text-lg font-semibold">
          {storeStatus.isOpen ? '¡Abierto!' : 'Cerrado'}
        </p>
        <p className="text-sm">{storeStatus.message}</p>
      </div>
    </div>
  );
};
