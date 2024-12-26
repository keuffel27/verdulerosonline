import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import type { WeekSchedule } from '../../../types/store';
import { getStoreSchedule, updateStoreSchedule, isStoreOpen } from '../../../services/schedule';

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
    // Actualizar el estado de la tienda cada minuto
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
      toast.error('Error al cargar el horario', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!storeId || saving) return;

    setSaving(true);
    try {
      console.log('Guardando horario:', schedule);
      await updateStoreSchedule(storeId, schedule);
      
      // Refrescar el estado inmediatamente
      const status = isStoreOpen(schedule);
      console.log('Nuevo estado:', status);
      setStoreStatus(status);
      
      toast.success('Horario guardado correctamente', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Error al guardar el horario', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Horario de Atención
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configura los horarios de apertura y cierre de tu tienda.
              </p>
              <p className="mt-1 text-sm text-blue-500">
                Hora actual: {new Date().toLocaleTimeString()} - 
                Estado: {storeStatus.isOpen ? 'Abierto' : 'Cerrado'} - 
                {storeStatus.nextChange}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                storeStatus.isOpen
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  {storeStatus.isOpen ? 'Abierto' : 'Cerrado'} - {storeStatus.nextChange}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {Object.entries(dayNames).map(([day, dayName]) => (
              <div
                key={day}
                className={`p-4 rounded-lg border ${
                  schedule[day].isOpen ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">{dayName}</h4>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        schedule[day].isOpen ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">
                        {schedule[day].isOpen ? 'Desactivar día' : 'Activar día'}
                      </span>
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          schedule[day].isOpen ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {schedule[day].isOpen && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Mañana</h5>
                      <div className="flex space-x-2">
                        <div>
                          <label htmlFor={`${day}-morning-open`} className="sr-only">
                            Apertura mañana
                          </label>
                          <input
                            type="time"
                            id={`${day}-morning-open`}
                            value={schedule[day].morning.open}
                            onChange={(e) =>
                              handleTimeChange(day, 'morning', 'open', e.target.value)
                            }
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <span className="text-gray-500">a</span>
                        <div>
                          <label htmlFor={`${day}-morning-close`} className="sr-only">
                            Cierre mañana
                          </label>
                          <input
                            type="time"
                            id={`${day}-morning-close`}
                            value={schedule[day].morning.close}
                            onChange={(e) =>
                              handleTimeChange(day, 'morning', 'close', e.target.value)
                            }
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Tarde</h5>
                      <div className="flex space-x-2">
                        <div>
                          <label htmlFor={`${day}-afternoon-open`} className="sr-only">
                            Apertura tarde
                          </label>
                          <input
                            type="time"
                            id={`${day}-afternoon-open`}
                            value={schedule[day].afternoon.open}
                            onChange={(e) =>
                              handleTimeChange(day, 'afternoon', 'open', e.target.value)
                            }
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <span className="text-gray-500">a</span>
                        <div>
                          <label htmlFor={`${day}-afternoon-close`} className="sr-only">
                            Cierre tarde
                          </label>
                          <input
                            type="time"
                            id={`${day}-afternoon-close`}
                            value={schedule[day].afternoon.close}
                            onChange={(e) =>
                              handleTimeChange(day, 'afternoon', 'close', e.target.value)
                            }
                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              ) : (
                <Clock className="-ml-1 mr-2 h-5 w-5" />
              )}
              Guardar Horario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
