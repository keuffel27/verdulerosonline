import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
  storeId: string;
}

interface TimeSlot {
  open: string;
  close: string;
}

interface DaySchedule {
  isOpen: boolean;
  morning: TimeSlot;
  afternoon: TimeSlot;
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

export const StoreStatus: React.FC<Props> = ({ storeId }) => {
  const [status, setStatus] = useState({ isOpen: false, message: 'Cargando...' });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('Checking status for storeId:', storeId);
        
        // Obtener el horario de la tienda
        const { data: scheduleData, error } = await supabase
          .from('store_schedule')
          .select('schedule')
          .eq('store_id', storeId)
          .single();

        console.log('Schedule data received:', scheduleData);

        if (error) {
          console.error('Error fetching schedule:', error);
          // Si no hay horario configurado, usar uno por defecto
          if (error.code === 'PGRST116') {
            const schedule: WeekSchedule = {
              monday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              tuesday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              wednesday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              thursday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              friday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              saturday: {
                isOpen: true,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
              sunday: {
                isOpen: false,
                morning: { open: '09:00', close: '13:00' },
                afternoon: { open: '16:00', close: '20:00' },
              },
            };
            processSchedule(schedule);
            return;
          }
          setStatus({ isOpen: false, message: 'Error al cargar horario' });
          return;
        }

        if (!scheduleData?.schedule) {
          console.log('No schedule data found');
          setStatus({ isOpen: false, message: 'Horario no configurado' });
          return;
        }

        processSchedule(scheduleData.schedule);
      } catch (error) {
        console.error('Error checking store status:', error);
        setStatus({ isOpen: false, message: 'Error al verificar horario' });
      }
    };

    const processSchedule = (schedule: WeekSchedule) => {
      const now = new Date();
      const currentDay = format(now, 'EEEE', { locale: es }).toLowerCase();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      console.log('Current day:', currentDay);
      console.log('Current time:', currentTime);
      console.log('Full schedule:', schedule);

      const todaySchedule = schedule[currentDay];
      console.log('Today schedule:', todaySchedule);

      if (!todaySchedule || !todaySchedule.isOpen) {
        // Buscar el próximo día que abre
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const currentDayIndex = days.indexOf(currentDay);
        let nextOpenDay = '';
        let daysUntilOpen = 0;

        for (let i = 1; i <= 7; i++) {
          const checkIndex = (currentDayIndex + i) % 7;
          if (schedule[days[checkIndex]]?.isOpen) {
            nextOpenDay = days[checkIndex];
            daysUntilOpen = i;
            break;
          }
        }

        if (nextOpenDay) {
          const nextDayName = format(
            new Date(now.getTime() + daysUntilOpen * 24 * 60 * 60 * 1000),
            'EEEE',
            { locale: es }
          );
          const openTime = schedule[nextOpenDay].morning.open;
          setStatus({
            isOpen: false,
            message: `Cerrado • Abre ${daysUntilOpen === 1 ? 'mañana' : nextDayName} a las ${openTime}`
          });
        } else {
          setStatus({ isOpen: false, message: 'Cerrado' });
        }
        return;
      }

      // Comprobar si está dentro del horario de apertura
      const isMorningTime = currentTime >= todaySchedule.morning.open && currentTime < todaySchedule.morning.close;
      const isAfternoonTime = currentTime >= todaySchedule.afternoon.open && currentTime < todaySchedule.afternoon.close;

      if (isMorningTime) {
        setStatus({
          isOpen: true,
          message: `Abierto • Cierra en el turno mañana a las ${todaySchedule.morning.close}`
        });
      } else if (isAfternoonTime) {
        setStatus({
          isOpen: true,
          message: `Abierto • Cierra en el turno tarde a las ${todaySchedule.afternoon.close}`
        });
      } else if (currentTime < todaySchedule.morning.open) {
        setStatus({
          isOpen: false,
          message: `Cerrado • Abre en el turno mañana a las ${todaySchedule.morning.open}`
        });
      } else if (currentTime < todaySchedule.afternoon.open) {
        setStatus({
          isOpen: false,
          message: `Cerrado • Abre en el turno tarde a las ${todaySchedule.afternoon.open}`
        });
      } else {
        // Después del cierre de la tarde
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowDay = format(tomorrow, 'EEEE', { locale: es }).toLowerCase();
        if (schedule[tomorrowDay]?.isOpen) {
          setStatus({
            isOpen: false,
            message: `Cerrado • Abre mañana en el turno mañana a las ${schedule[tomorrowDay].morning.open}`
          });
        } else {
          // Buscar el próximo día que abre
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const currentDayIndex = days.indexOf(currentDay);
          let nextOpenDay = '';
          let daysUntilOpen = 0;

          for (let i = 2; i <= 7; i++) {
            const checkIndex = (currentDayIndex + i) % 7;
            if (schedule[days[checkIndex]]?.isOpen) {
              nextOpenDay = days[checkIndex];
              daysUntilOpen = i;
              break;
            }
          }

          if (nextOpenDay) {
            const nextDayName = format(
              new Date(now.getTime() + daysUntilOpen * 24 * 60 * 60 * 1000),
              'EEEE',
              { locale: es }
            );
            setStatus({
              isOpen: false,
              message: `Cerrado • Abre el ${nextDayName} en el turno mañana a las ${schedule[nextOpenDay].morning.open}`
            });
          } else {
            setStatus({
              isOpen: false,
              message: 'Cerrado permanentemente'
            });
          }
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [storeId]);

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
      status.isOpen 
        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-green-100/50' 
        : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 shadow-red-100/50'
    } shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}>
      <div className={`p-1.5 rounded-lg mr-3 ${
        status.isOpen 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
          : 'bg-gradient-to-br from-red-500 to-rose-600'
      }`}>
        <Clock className="w-4 h-4 text-white" />
      </div>
      <span className="font-semibold">{status.message}</span>
    </div>
  );
};
