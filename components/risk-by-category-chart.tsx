// components/risk-by-category-chart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryRisk {
  category: string;
  fraudCount: number;
  totalCount: number;
  fraudRate: number;
}

export function RiskByCategoryChart({ data }: { data: CategoryRisk[] }) {
  // Mock data if not provided
  const chartData = data || [
    { category: 'Groceries', fraudCount: 2, totalCount: 150, fraudRate: 1.3 },
    { category: 'Online Shopping', fraudCount: 8, totalCount: 120, fraudRate: 6.7 },
    { category: 'Gas Station', fraudCount: 1, totalCount: 180, fraudRate: 0.6 },
    { category: 'Wire Transfer', fraudCount: 15, totalCount: 95, fraudRate: 15.8 },
    { category: 'Travel', fraudCount: 5, totalCount: 60, fraudRate: 8.3 },
    { category: 'Entertainment', fraudCount: 3, totalCount: 85, fraudRate: 3.5 },
  ];

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Risk by Merchant Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="category" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            labelStyle={{ color: '#111827' }}
          />
          <Legend />
          <Bar 
            dataKey="fraudCount" 
            fill="#ef4444" 
            radius={[8, 8, 0, 0]}
            name="Fraud Count"
          />
          <Bar 
            dataKey="totalCount" 
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]}
            name="Total Count"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
