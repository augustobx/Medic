'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Calendar,
  Users,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  LayoutDashboard,
} from 'lucide-react';

const navItems = [
  { href: '/calendar', label: 'Calendario', icon: Calendar },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/finance', label: 'Finanzas', icon: DollarSign },
  { href: '/settings', label: 'Configuración', icon: Settings },
  // NOTE: NO "Documentos" button here — documents are ONLY in patient record
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'hidden lg:flex flex-col h-screen sticky top-0 border-r border-surface-700/50',
        'bg-surface-900/95 backdrop-blur-sm transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-700/50">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold gradient-text whitespace-nowrap">MedicTurn</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.href.replace('/', '')}`}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200',
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary-500" />
              )}
              <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-primary-400')} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 py-4 border-t border-surface-700/50 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-all duration-200"
        >
          <ChevronLeft className={clsx('w-5 h-5 transition-transform duration-300', collapsed && 'rotate-180')} />
          {!collapsed && <span className="text-sm font-medium">Colapsar</span>}
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          id="btn-logout"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-surface-400 hover:bg-danger-500/10 hover:text-danger-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
