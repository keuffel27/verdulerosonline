import { supabase } from '../lib/supabase';
import type { WeekSchedule } from '../types/store';

export async function getStoreSchedule(storeId: string): Promise<WeekSchedule> {
  const { data, error } = await supabase
    .from('store_schedule')
    .select('*')
    .eq('store_id', storeId)
    .single();

  if (error) throw error;
  return data.schedule;
}

export async function updateStoreSchedule(storeId: string, schedule: WeekSchedule): Promise<void> {
  const { error } = await supabase
    .from('store_schedule')
    .upsert([{ store_id: storeId, schedule }]);

  if (error) throw error;
}

export function isStoreOpen(schedule: WeekSchedule): { isOpen: boolean; nextChange: string } {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  const daySchedule = schedule[currentDay];
  if (!daySchedule.isOpen) {
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
      nextChange: `Abre ${daysUntilOpen === 1 ? 'mañana' : `en ${daysUntilOpen} días`} a las ${nextOpenTime}`
    };
  }

  // Verificar si está dentro del horario de apertura
  const isMorning = isTimeInRange(currentTime, daySchedule.morning.open, daySchedule.morning.close);
  const isAfternoon = isTimeInRange(currentTime, daySchedule.afternoon.open, daySchedule.afternoon.close);

  if (isMorning) {
    return {
      isOpen: true,
      nextChange: `Cierra a las ${daySchedule.morning.close}`
    };
  }

  if (isAfternoon) {
    return {
      isOpen: true,
      nextChange: `Cierra a las ${daySchedule.afternoon.close}`
    };
  }

  // Si no está en ningún rango, calcular próxima apertura
  if (currentTime < daySchedule.morning.open) {
    return {
      isOpen: false,
      nextChange: `Abre hoy a las ${daySchedule.morning.open}`
    };
  }

  if (currentTime < daySchedule.afternoon.open) {
    return {
      isOpen: false,
      nextChange: `Abre hoy a las ${daySchedule.afternoon.open}`
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
    nextChange: `Abre ${daysUntilOpen === 1 ? 'mañana' : `en ${daysUntilOpen} días`} a las ${schedule[nextOpenDay].morning.open}`
  };
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  return time >= start && time <= end;
}
