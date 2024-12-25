import { supabase } from '../lib/supabase';
import type { WeekSchedule } from '../types/store';

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

function getTimeInMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTimeRemaining(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutos`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${remainingMinutes} minutos`;
}

export function isStoreOpen(schedule: WeekSchedule): { isOpen: boolean; nextChange: string } {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;
  
  const daySchedule = schedule[currentDay];
  if (!daySchedule?.isOpen) {
    // Encontrar el próximo día que abre
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayIndex = days.indexOf(currentDay);
    let nextOpenDay = '';
    let daysUntilOpen = 0;
    
    for (let i = 1; i <= 7; i++) {
      const checkIndex = (currentDayIndex + i) % 7;
      if (schedule[days[checkIndex]].isOpen) {
        nextOpenDay = days[checkIndex];
        daysUntilOpen = i;
        break;
      }
    }
    
    const nextOpenTime = schedule[nextOpenDay].morning.open;
    return {
      isOpen: false,
      nextChange: `Cerrado, abre ${daysUntilOpen === 1 ? 'mañana' : `en ${daysUntilOpen} días`} a las ${nextOpenTime}`
    };
  }

  // Convertir los horarios a minutos para facilitar la comparación
  const morningOpenInMinutes = getTimeInMinutes(daySchedule.morning.open);
  const morningCloseInMinutes = getTimeInMinutes(daySchedule.morning.close);
  const afternoonOpenInMinutes = getTimeInMinutes(daySchedule.afternoon.open);
  const afternoonCloseInMinutes = getTimeInMinutes(daySchedule.afternoon.close);

  // Verificar si está dentro del horario de apertura
  const isMorning = currentTimeInMinutes >= morningOpenInMinutes && currentTimeInMinutes < morningCloseInMinutes;
  const isAfternoon = currentTimeInMinutes >= afternoonOpenInMinutes && currentTimeInMinutes < afternoonCloseInMinutes;

  if (isMorning) {
    const minutesUntilClose = morningCloseInMinutes - currentTimeInMinutes;
    return {
      isOpen: true,
      nextChange: `Abierto, cierra en ${formatTimeRemaining(minutesUntilClose)}`
    };
  }

  if (isAfternoon) {
    const minutesUntilClose = afternoonCloseInMinutes - currentTimeInMinutes;
    return {
      isOpen: true,
      nextChange: `Abierto, cierra en ${formatTimeRemaining(minutesUntilClose)}`
    };
  }

  // Si no está en ningún rango, calcular próxima apertura
  if (currentTimeInMinutes < morningOpenInMinutes) {
    const minutesUntilOpen = morningOpenInMinutes - currentTimeInMinutes;
    return {
      isOpen: false,
      nextChange: `Cerrado, abre en ${formatTimeRemaining(minutesUntilOpen)}`
    };
  }

  if (currentTimeInMinutes < afternoonOpenInMinutes) {
    const minutesUntilOpen = afternoonOpenInMinutes - currentTimeInMinutes;
    return {
      isOpen: false,
      nextChange: `Cerrado, abre en ${formatTimeRemaining(minutesUntilOpen)}`
    };
  }

  // Si ya pasó el último horario del día, buscar el próximo día
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const currentDayIndex = days.indexOf(currentDay);
  let nextOpenDay = '';
  let daysUntilOpen = 0;

  for (let i = 1; i <= 7; i++) {
    const checkIndex = (currentDayIndex + i) % 7;
    if (schedule[days[checkIndex]].isOpen) {
      nextOpenDay = days[checkIndex];
      daysUntilOpen = i;
      break;
    }
  }

  return {
    isOpen: false,
    nextChange: `Cerrado, abre ${daysUntilOpen === 1 ? 'mañana' : `en ${daysUntilOpen} días`} a las ${schedule[nextOpenDay].morning.open}`
  };
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  return time >= start && time <= end;
}
