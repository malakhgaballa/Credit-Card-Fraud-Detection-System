// app/(protected)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { DashboardKPIs } from '@/components/dashboard-kpi-cards';
import { FraudTrendChart } from '@/components/fraud-trend-chart';
import { RiskByCategoryChart } from '@/components/risk-by-category-chart';
import { AlertTriangle, TrendingUp, BarChart3, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const { getAuthToken } = useAuth();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      apiClient.setToken(token);
    }

    const fetchStats = async () => {
      try {
        const data = await apiClient.getDashboardStats(timeRange);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange, getAuthToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Real-time fraud detection analytics and metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === days
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardKPIs stats={stats} />

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FraudTrendChart data={null} />
        <RiskByCategoryChart data={null} />
      </div>

      {/* Bottom Row - Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fraudulent Amount Card */}
        <div className="p-6 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-red-900">Fraudulent Amount</h3>
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-red-900">
            ${(stats?.fraudulent_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-red-700 mt-2">Blocked transactions in period</p>
        </div>

        {/* Avg Fraud Probability */}
        <div className="p-6 rounded-lg border border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-yellow-900">Avg Risk Score</h3>
            <TrendingUp className="text-yellow-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-yellow-900">
            {((stats?.average_fraud_probability || 0) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-yellow-700 mt-2">Average fraud probability</p>
        </div>

        {/* Legitimate Amount */}
        <div className="p-6 rounded-lg border border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-green-900">Legitimate Amount</h3>
            <BarChart3 className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-900">
            ${(stats?.legitimate_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-700 mt-2">Approved transactions</p>
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-orange-500" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Recent High-Risk Alerts</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium text-foreground">High fraud probability detected</p>
              <p className="text-sm text-muted-foreground mt-1">Wire transfer - $5,000 to unknown merchant</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              Critical
            </span>
          </div>

          <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium text-foreground">Geographic anomaly</p>
              <p className="text-sm text-muted-foreground mt-1">Transaction 800km from customer location</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              High
            </span>
          </div>

          <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium text-foreground">Unusual time pattern</p>
              <p className="text-sm text-muted-foreground mt-1">Multiple transactions between 2-4 AM</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
              Medium
            </span>
          </div>
        </div>

        <button className="mt-4 w-full py-2 px-4 rounded-lg border border-border hover:bg-muted transition-colors text-foreground font-medium">
          View All Alerts
        </button>
      </div>
    </div>
  );
}
