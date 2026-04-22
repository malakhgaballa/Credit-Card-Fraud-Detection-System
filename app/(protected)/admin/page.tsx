// app/(protected)/admin/page.tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Users, Settings, Shield, BarChart3 } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">System configuration and management</p>
      </div>

      {/* Admin Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">User Management</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage bank employees and roles</p>
              <button className="text-primary text-sm font-medium hover:underline">
                Go to Users →
              </button>
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Settings className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">Model settings and thresholds</p>
              <button className="text-primary text-sm font-medium hover:underline">
                Configure →
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">Security</h3>
              <p className="text-sm text-muted-foreground mb-4">SSO and access control settings</p>
              <button className="text-primary text-sm font-medium hover:underline">
                Manage Security →
              </button>
            </div>
          </div>
        </div>

        {/* Analytics & Reporting */}
        <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BarChart3 className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">System performance and metrics</p>
              <button className="text-primary text-sm font-medium hover:underline">
                View Analytics →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">API Status</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Database</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Model Service</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Running
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
