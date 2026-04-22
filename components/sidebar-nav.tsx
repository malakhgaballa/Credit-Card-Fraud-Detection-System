// components/sidebar-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  BarChart3,
  FileText,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useState } from 'react';

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['analyst', 'admin', 'viewer'] },
    { href: '/analyze', label: 'Analyze Transaction', icon: BarChart3, roles: ['analyst', 'admin'] },
    { href: '/history', label: 'Transaction History', icon: FileText, roles: ['analyst', 'admin', 'viewer'] },
    { href: '/alerts', label: 'Alerts', icon: AlertTriangle, roles: ['analyst', 'admin'] },
    { href: '/admin', label: 'Admin Panel', icon: Settings, roles: ['admin'] },
  ];

  const userNavItems = navItems.filter(item => item.roles.includes(user?.role || 'viewer'));

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex flex-col transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">FraudShield</h1>
          <p className="text-sm text-muted-foreground mt-1">Enterprise Fraud Detection</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-border">
            <p className="font-semibold text-sm text-foreground">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary capitalize">
              {user.role}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-auto p-4 space-y-2">
          {userNavItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
