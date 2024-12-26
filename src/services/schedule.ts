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
  const { error } = await supabase
    .from('store_schedule')
    .upsert([{ store_id: storeId, schedule }]);

  if (error) throw error;
}

function parseTimeString(timeStr: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function getCurrentTimeString(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function isStoreOpen(schedule: WeekSchedule): { isOpen: boolean; nextChange: string } {
  const now = new Date();
  const currentDay = format(now, 'EEEE', { locale: es }).toLowerCase();
  const todaySchedule = schedule[currentDay];
  const currentTime = getCurrentTimeString();

  // Si el día está marcado como cerrado
  if (!todaySchedule?.isOpen) {
    // Buscar el próximo día que abre
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayIndex = days.indexOf(currentDay);
    
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      if (schedule[nextDay]?.isOpen) {
        const nextOpenDate = addDays(now, i);
        const nextDayName = format(nextOpenDate, 'EEEE', { locale: es });
        return {
          isOpen: false,
          nextChange: `Abre ${i === 1 ? 'mañana' : nextDayName} a las ${schedule[nextDay].morning.open}`
        };
      }
    }
    return { isOpen: false, nextChange: 'Cerrado' };
  }

  // Comprobar si estamos en el horario de la mañana
  if (currentTime >= todaySchedule.morning.open && currentTime < todaySchedule.morning.close) {
    return {
      isOpen: true,
      nextChange: `Cierra a las ${todaySchedule.morning.close}`
    };
  }

  // Comprobar si estamos en el horario de la tarde
  if (currentTime >= todaySchedule.afternoon.open && currentTime < todaySchedule.afternoon.close) {
    return {
      isOpen: true,
      nextChange: `Cierra a las ${todaySchedule.afternoon.close}`
    };
  }

  // Si estamos antes del horario de apertura de la mañana
  if (currentTime < todaySchedule.morning.open) {
    return {
      isOpen: false,
      nextChange: `Abre hoy a las ${todaySchedule.morning.open}`
    };
  }

  // Si estamos en el descanso del mediodía
  if (currentTime >= todaySchedule.morning.close && currentTime < todaySchedule.afternoon.open) {
    return {
      isOpen: false,
      nextChange: `Abre a las ${todaySchedule.afternoon.open}`
    };
  }

  // Si estamos después del cierre de la tarde
  if (currentTime >= todaySchedule.afternoon.close) {
    // Buscar el próximo día que abre
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayIndex = days.indexOf(currentDay);
    const tomorrow = days[(currentDayIndex + 1) % 7];
    
    if (schedule[tomorrow]?.isOpen) {
      return {
        isOpen: false,
        nextChange: `Abre mañana a las ${schedule[tomorrow].morning.open}`
      };
    }

    // Si mañana no abre, buscar el próximo día que abra
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
