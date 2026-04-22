// components/fraud-trend-chart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendDataPoint {
  date: string;
  legitimate: number;
  suspicious: number;
  fraudulent: number;
}

export function FraudTrendChart({ data }: { data: any[] | null }) {
  // Transform incoming data format to chart format
  let chartData = [];
  
  if (data && Array.isArray(data) && data.length > 0) {
    chartData = data.map(point => ({
      date: point.date || point.dateString,
      transactions: point.transactions || 0,
      fraud: point.fraud || 0,
      detection_rate: parseFloat(point.detection_rate) || 0,
    }));
  } else {
    // Fallback mock data
    chartData = [
      { date: 'Mon', transactions: 950, fraud: 28, detection_rate: 2.9 },
      { date: 'Tue', transactions: 1020, fraud: 35, detection_rate: 3.4 },
      { date: 'Wed', transactions: 890, fraud: 22, detection_rate: 2.5 },
      { date: 'Thu', transactions: 980, fraud: 32, detection_rate: 3.3 },
      { date: 'Fri', transactions: 1150, fraud: 48, detection_rate: 4.2 },
      { date: 'Sat', transactions: 820, fraud: 18, detection_rate: 2.2 },
      { date: 'Sun', transactions: 750, fraud: 15, detection_rate: 2.0 },
    ];
  }

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Fraud Detection Trend (7 Days)</h3>
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
            dataKey="transactions" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Transactions"
          />
          <Line 
            type="monotone" 
            dataKey="fraud" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
            name="Fraud Detected"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
