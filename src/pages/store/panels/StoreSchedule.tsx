import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Loader2, Save, Sun, Moon, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import type { WeekSchedule } from '../../../types/store';
import { getStoreSchedule, updateStoreSchedule, isStoreOpen } from '../../../services/schedule';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoreSchedule() {
  const { storeId } = useParams<{ storeId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<WeekSchedule>({
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
  });

  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean; nextChange: string }>({
    isOpen: false,
    nextChange: '',
  });

  useEffect(() => {
    if (storeId) {
      loadSchedule();
    }
  }, [storeId]);

  useEffect(() => {
    const status = isStoreOpen(schedule);
    setStoreStatus(status);

    const interval = setInterval(() => {
      const status = isStoreOpen(schedule);
      setStoreStatus(status);
    }, 60000);

    return () => clearInterval(interval);
  }, [schedule]);

  const loadSchedule = async () => {
    try {
      const data = await getStoreSchedule(storeId!);
      setSchedule(data);
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Error al cargar el horario');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!storeId || saving) return;

    setSaving(true);
    try {
      await updateStoreSchedule(storeId, schedule);
      const status = isStoreOpen(schedule);
      setStoreStatus(status);
      toast.success('Horario guardado correctamente');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Error al guardar el horario');
    } finally {
      setSaving(false);
    }
  };

  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  // Orden específico de los días
  const orderedDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  const handleTimeChange = (
    day: string,
    period: 'morning' | 'afternoon',
    type: 'open' | 'close',
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: {
          ...prev[day][period],
          [type]: value,
        },
      },
    }));
  };

  const handleDayToggle = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-green-500 border-t-transparent animate-spin mx-auto"></div>
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin absolute top-0 left-1/2 -translate-x-1/2" 
               style={{ animationDirection: 'reverse', opacity: 0.5 }}></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-5 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Calendar className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Horario de Atención
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Configura los horarios de apertura y cierre de tu tienda.
            </p>
            <motion.div
              animate={{
                backgroundColor: storeStatus.isOpen ? 'rgb(220 252 231)' : 'rgb(254 226 226)',
                color: storeStatus.isOpen ? 'rgb(22 101 52)' : 'rgb(153 27 27)',
              }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-3 rounded-xl flex items-center space-x-2"
            >
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">
                {storeStatus.isOpen ? 'Abierto' : 'Cerrado'} - {storeStatus.nextChange}
              </span>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 md:mt-0 md:col-span-2 px-4 py-5 sm:p-6"
          >
            <div className="space-y-4">
              <AnimatePresence>
                {orderedDays.map((day, index) => {
                  const daySchedule = schedule[day];
                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        daySchedule.isOpen 
                          ? 'border-green-200 bg-green-50/50' 
                          : 'border-gray-200 bg-gray-50/50'
                      } transition-colors duration-200`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">{dayNames[day]}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {daySchedule.isOpen ? 'Estado: Abierto' : 'Estado: Cerrado'}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDayToggle(day)}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                              daySchedule.isOpen
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          >
                            <span className="sr-only">
                              {daySchedule.isOpen ? 'Cerrar día' : 'Abrir día'}
                            </span>
                            <span
                              className={`${
                                daySchedule.isOpen ? 'translate-x-9' : 'translate-x-1'
                              } inline-block h-6 w-6 transform rounded-full bg-white transition-transform`}
                            />
                          </motion.button>
                        </div>
                      </div>

                      {daySchedule.isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Sun className="h-4 w-4 text-amber-500" />
                              <span className="text-sm text-gray-600">Mañana</span>
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="time"
                                value={daySchedule.morning.open}
                                onChange={(e) => handleTimeChange(day, 'morning', 'open', e.target.value)}
                                className="block w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                              <span className="text-gray-500">-</span>
                              <input
                                type="time"
                                value={daySchedule.morning.close}
                                onChange={(e) => handleTimeChange(day, 'morning', 'close', e.target.value)}
                                className="block w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Moon className="h-4 w-4 text-indigo-500" />
                              <span className="text-sm text-gray-600">Tarde</span>
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="time"
                                value={daySchedule.afternoon.open}
                                onChange={(e) => handleTimeChange(day, 'afternoon', 'open', e.target.value)}
                                className="block w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                              <span className="text-gray-500">-</span>
                              <input
                                type="time"
                                value={daySchedule.afternoon.close}
                                onChange={(e) => handleTimeChange(day, 'afternoon', 'close', e.target.value)}
                                className="block w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveSchedule}
                disabled={saving}
                className="w-full mt-6 inline-flex items-center justify-center px-4 py-2 rounded-xl shadow-lg text-sm font-medium text-white
                         bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
