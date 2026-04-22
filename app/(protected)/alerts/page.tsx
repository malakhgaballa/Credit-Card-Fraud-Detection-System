// app/(protected)/alerts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const { getAuthToken } = useAuth();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      apiClient.setToken(token);
    }

    const fetchAlerts = async () => {
      try {
        const data = await apiClient.getAlerts({ 
          resolved: filter === 'resolved' ? true : filter === 'unresolved' ? false : undefined 
        });
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [filter, getAuthToken]);

  const handleResolveAlert = async (alertId: string) => {
    try {
      await apiClient.updateAlert(alertId, { is_resolved: true });
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alerts & Notifications</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage fraud detection alerts</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-border">
        {(['all', 'unresolved', 'resolved'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No alerts found</div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 flex items-start justify-between ${getPriorityColor(alert.priority)} bg-opacity-10`}
            >
              <div className="flex items-start gap-4 flex-1">
                <AlertTriangle size={20} className="mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{alert.alert_type}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Transaction ID: {alert.transaction_id}
                  </p>
                </div>
              </div>

              {!alert.is_resolved && (
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  className="ml-4 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  Resolve
                </button>
              )}
              {alert.is_resolved && (
                <div className="ml-4 text-green-600 flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span className="text-sm">Resolved</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
