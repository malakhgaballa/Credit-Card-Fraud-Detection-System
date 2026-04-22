// components/dashboard-kpi-cards.tsx
'use client';

import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'red' | 'green' | 'yellow';
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  red: 'bg-red-50 border-red-200 text-red-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
};

const iconColorMap = {
  blue: 'text-blue-600',
  red: 'text-red-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
};

export function KPICard({ label, value, change, icon, trend, color }: KPICardProps) {
  return (
    <div className={`p-6 rounded-lg border ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              {trend === 'up' && <TrendingUp size={16} className="text-red-600" />}
              {trend === 'down' && <TrendingDown size={16} className="text-green-600" />}
              <span className={trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                {trend === 'up' ? '+' : '-'}{Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-white/50 ${iconColorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardKPIs({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Total Transactions"
        value={stats?.total_transactions || 0}
        icon={<CheckCircle size={24} />}
        color="blue"
        change={5}
        trend="up"
      />
      <KPICard
        label="Fraud Detected"
        value={stats?.fraud_detected || 0}
        icon={<AlertTriangle size={24} />}
        color="red"
        change={2}
        trend="up"
      />
      <KPICard
        label="Detection Rate"
        value={`${(stats?.detection_rate || 0).toFixed(1)}%`}
        icon={<TrendingUp size={24} />}
        color="green"
        change={0.3}
        trend="up"
      />
      <KPICard
        label="Pending Reviews"
        value={stats?.pending_reviews || 0}
        icon={<AlertTriangle size={24} />}
        color="yellow"
      />
    </div>
  );
}
