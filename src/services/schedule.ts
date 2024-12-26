import { supabase } from '../lib/supabase';
import type { WeekSchedule } from '../types/store';
import { format, parse, isWithinInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export async function getStoreSchedule(storeId: string): Promise<WeekSchedule> {
  const { data, error } = await supabase
    .from('store_schedule')
    .select('*')
    .eq('store_id', storeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Si no hay horario configurado, crear uno por defecto
      const defaultSchedule: WeekSchedule = {
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
      
      // Intentar crear el horario por defecto
      try {
        await updateStoreSchedule(storeId, defaultSchedule);
        return defaultSchedule;
      } catch (updateError) {
        console.error('Error creating default schedule:', updateError);
        throw updateError;
      }
    }
    throw error;
  }
  return data.schedule;
}

export async function updateStoreSchedule(storeId: string, schedule: WeekSchedule): Promise<void> {
  // Primero intentamos actualizar el registro existente
  const { error: updateError } = await supabase
    .from('store_schedule')
    .update({ schedule })
    .eq('store_id', storeId);

  // Si no existe el registro, lo creamos
  if (updateError) {
    const { error: insertError } = await supabase
      .from('store_schedule')
      .insert([{ store_id: storeId, schedule }]);

    if (insertError) throw insertError;
  }
}

function parseTimeString(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

// Mapeo de días en español a inglés
const dayMapping = {
  'lunes': 'monday',
  'martes': 'tuesday',
  'miércoles': 'wednesday',
  'jueves': 'thursday',
  'viernes': 'friday',
  'sábado': 'saturday',
  'domingo': 'sunday'
};

export function isStoreOpen(schedule: WeekSchedule): { isOpen: boolean; nextChange: string } {
  const now = new Date();
  const currentDaySpanish = format(now, 'EEEE', { locale: es }).toLowerCase();
  const currentDay = dayMapping[currentDaySpanish];
  const todaySchedule = schedule[currentDay];

  console.log('Debug isStoreOpen:', {
    now: now.toLocaleTimeString(),
    currentDaySpanish,
    currentDay,
    todaySchedule,
  });

  // Si el día está marcado como cerrado
  if (!todaySchedule?.isOpen) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayIndex = days.indexOf(currentDay);
    
    // Buscar el próximo día que abra
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      if (schedule[nextDay]?.isOpen) {
        const nextOpenDate = addDays(now, i);
        const nextDayName = format(nextOpenDate, 'EEEE', { locale: es });
        return {
          isOpen: false,
          nextChange: `Abre ${i === 1 ? 'mañana' : 'el ' + nextDayName} a las ${schedule[nextDay].morning.open}`
        };
      }
    }
    return { isOpen: false, nextChange: 'Cerrado permanentemente' };
  }

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Convertir horarios a minutos desde medianoche para comparación más fácil
  const morningOpenTime = timeToMinutes(todaySchedule.morning.open);
  const morningCloseTime = timeToMinutes(todaySchedule.morning.close);
  const afternoonOpenTime = timeToMinutes(todaySchedule.afternoon.open);
  const afternoonCloseTime = timeToMinutes(todaySchedule.afternoon.close);

  console.log('Debug tiempos:', {
    currentTime,
    morningOpenTime,
    morningCloseTime,
    afternoonOpenTime,
    afternoonCloseTime
  });

  // Verificar si estamos en horario de mañana
  if (currentTime >= morningOpenTime && currentTime < morningCloseTime) {
    const minutesUntilClose = morningCloseTime - currentTime;
    return {
      isOpen: true,
      nextChange: formatTimeMessage(minutesUntilClose, 'Cierra')
    };
  }

  // Verificar si estamos en horario de tarde
  if (currentTime >= afternoonOpenTime && currentTime < afternoonCloseTime) {
    const minutesUntilClose = afternoonCloseTime - currentTime;
    return {
      isOpen: true,
      nextChange: formatTimeMessage(minutesUntilClose, 'Cierra')
    };
  }

  // Si estamos antes del horario de mañana
  if (currentTime < morningOpenTime) {
    const minutesUntilOpen = morningOpenTime - currentTime;
    return {
      isOpen: false,
      nextChange: formatTimeMessage(minutesUntilOpen, 'Abre')
    };
  }

  // Si estamos en el descanso del mediodía
  if (currentTime >= morningCloseTime && currentTime < afternoonOpenTime) {
    const minutesUntilOpen = afternoonOpenTime - currentTime;
    return {
      isOpen: false,
      nextChange: formatTimeMessage(minutesUntilOpen, 'Abre')
    };
  }

  // Si estamos después del cierre de la tarde
  if (currentTime >= afternoonCloseTime) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayIndex = days.indexOf(currentDay);
    const tomorrow = days[(currentDayIndex + 1) % 7];
    
    if (schedule[tomorrow]?.isOpen) {
      return {
        isOpen: false,
        nextChange: `Abre mañana a las ${schedule[tomorrow].morning.open}`
      };
    }

    // Buscar el próximo día que abra
    for (let i = 2; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      if (schedule[nextDay]?.isOpen) {
        const nextDayName = format(addDays(now, i), 'EEEE', { locale: es });
        return {
          isOpen: false,
          nextChange: `Abre el ${nextDayName} a las ${schedule[nextDay].morning.open}`
        };
      }
    }
  }

  return { isOpen: false, nextChange: 'Cerrado' };
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTimeMessage(minutes: number, prefix: string): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${prefix} en ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
  }
  
  if (remainingMinutes === 0) {
    return `${prefix} en ${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  
  return `${prefix} en ${hours} hora${hours !== 1 ? 's' : ''} y ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
}
