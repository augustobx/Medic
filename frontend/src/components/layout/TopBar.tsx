'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Menu, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function TopBar({ title, subtitle, onMenuToggle }: TopBarProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch notifications
    api.get('/notifications')
      .then(res => setNotifications(res || []))
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    } catch (e) {}
  };
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-surface-700/50 bg-surface-900/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left — Mobile menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
            id="btn-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-surface-100">{title}</h1>
            {subtitle && <p className="text-xs text-surface-400">{subtitle}</p>}
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            className="p-2.5 rounded-xl text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
            id="btn-search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2.5 rounded-xl text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
              id="btn-notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft" />
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-800 border border-surface-700 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-surface-700 font-semibold text-surface-200 flex justify-between items-center">
                  Notificaciones
                  {unreadCount > 0 && <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">{unreadCount}</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-surface-400">No hay notificaciones</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b border-surface-700/50 last:border-0 flex items-start justify-between gap-2 ${n.status === 'unread' ? 'bg-surface-700/20' : ''}`}>
                        <div>
                          <p className={`text-sm ${n.status === 'unread' ? 'text-surface-200 font-medium' : 'text-surface-400'}`}>{n.message}</p>
                          <span className="text-xs text-surface-500 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        {n.status === 'unread' && (
                          <button onClick={() => markAsRead(n.id)} className="p-1 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors" title="Marcar como leída">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="ml-2 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center cursor-pointer hover:shadow-glow-primary transition-shadow">
            <span className="text-sm font-bold text-white">P</span>
          </div>
        </div>
      </div>
    </header>
  );
}
