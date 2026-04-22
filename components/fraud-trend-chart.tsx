// components/fraud-trend-chart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendDataPoint {
  date: string;
  legitimate: number;
  suspicious: number;
  fraudulent: number;
}

export function FraudTrendChart({ data }: { data: TrendDataPoint[] }) {
  // Generate mock data if not provided
  const chartData = data || [
    { date: 'Mon', legitimate: 85, suspicious: 12, fraudulent: 3 },
    { date: 'Tue', legitimate: 92, suspicious: 15, fraudulent: 2 },
    { date: 'Wed', legitimate: 78, suspicious: 18, fraudulent: 4 },
    { date: 'Thu', legitimate: 88, suspicious: 14, fraudulent: 3 },
    { date: 'Fri', legitimate: 95, suspicious: 16, fraudulent: 5 },
    { date: 'Sat', legitimate: 72, suspicious: 11, fraudulent: 2 },
    { date: 'Sun', legitimate: 68, suspicious: 10, fraudulent: 1 },
  ];

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Fraud Detection Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            labelStyle={{ color: '#111827' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="legitimate" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
            activeDot={{ r: 6 }}
            name="Legitimate"
          />
          <Line 
            type="monotone" 
            dataKey="suspicious" 
            stroke="#eab308" 
            strokeWidth={2}
            dot={{ fill: '#eab308', r: 4 }}
            activeDot={{ r: 6 }}
            name="Suspicious"
          />
          <Line 
            type="monotone" 
            dataKey="fraudulent" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
            name="Fraudulent"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
