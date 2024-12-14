import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { WhatsAppStats } from '../../../types/supabase';

interface Props {
  stats: WhatsAppStats;
}

export default function WhatsAppStats({ stats }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Estadísticas de WhatsApp</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Mensajes"
          value={stats.total_messages}
          unit="mensajes"
        />
        <StatCard
          title="Tiempo de Respuesta"
          value={stats.response_time_avg}
          unit="minutos"
        />
        <StatCard
          title="Satisfacción"
          value={stats.customer_satisfaction}
          unit="%"
        />
      </div>

      <div className="h-96">
        <h3 className="text-lg font-semibold mb-4">Consultas más frecuentes</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={stats.most_common_queries.map((query, index) => ({
              name: query,
              value: index + 1
            }))}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
}

function StatCard({ title, value, unit }: StatCardProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">
        {value} <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );
}
