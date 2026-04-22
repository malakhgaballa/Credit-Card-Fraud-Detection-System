// components/risk-by-category-chart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryRisk {
  category: string;
  fraudCount: number;
  totalCount: number;
  fraudRate: number;
}

export function RiskByCategoryChart({ data }: { data: any[] | null }) {
  // Transform incoming data
  let chartData = [];
  
  if (data && Array.isArray(data) && data.length > 0) {
    chartData = data.map(item => ({
      category: item.category,
      risk_score: item.risk_score || 0,
      fraud_count: item.fraud_count || 0,
      transactions: item.transactions || 0,
    }));
  } else {
    // Fallback mock data
    chartData = [
      { category: 'Retail', risk_score: 12, fraud_count: 8, transactions: 2400 },
      { category: 'E-commerce', risk_score: 28, fraud_count: 42, transactions: 1800 },
      { category: 'Travel', risk_score: 35, fraud_count: 28, transactions: 950 },
      { category: 'Entertainment', risk_score: 18, fraud_count: 15, transactions: 1200 },
      { category: 'Wire Transfer', risk_score: 52, fraud_count: 85, transactions: 320 },
      { category: 'Gas/Fuel', risk_score: 8, fraud_count: 5, transactions: 1400 },
    ];
  }

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Risk Score by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="category" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            labelStyle={{ color: '#111827' }}
            formatter={(value) => value.toFixed(1)}
          />
          <Legend />
          <Bar 
            dataKey="risk_score" 
            fill="#ef4444" 
            radius={[8, 8, 0, 0]}
            name="Risk Score"
          />
          <Bar 
            dataKey="fraud_count" 
            fill="#f97316" 
            radius={[8, 8, 0, 0]}
            name="Fraud Count"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
