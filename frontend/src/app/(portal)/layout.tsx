
'use client';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Clock, User, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

function PortalNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { href: '/booking', label: 'Reservar', icon: Calendar },
    { href: '/my-appointments', label: 'Mis Turnos', icon: Clock },
    { href: '/profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
            pathname === item.href || pathname.startsWith(item.href + '/')
              ? 'bg-primary-500/10 text-primary-400'
              : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
          )}
        >
          <item.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{item.label}</span>
        </Link>
      ))}
      <button 
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all ml-auto"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </nav>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PortalContent>{children}</PortalContent>
    </AuthProvider>
  );
}

function PortalContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="min-h-screen bg-surface-950 flex items-center justify-center text-surface-400">Cargando...</div>;
  }

  // @ts-ignore
  const isMissingAnamnesis = user?.role === 'PATIENT' && user?.patient?._count?.anamneses === 0;
  const isOnboarding = pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-surface-950">
      <header className="sticky top-0 z-30 border-b border-surface-700/50 bg-surface-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 gap-3 sm:gap-0">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold gradient-text">MedicTurn</span>
            </div>
            <span className="text-xs text-surface-400 sm:hidden">Portal del Paciente</span>
          </div>
          
          <PortalNav />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isMissingAnamnesis && !isOnboarding ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-warning-500/20 border border-warning-500/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-surface-100">Acción Requerida</h1>
            <p className="text-surface-400 mt-2 max-w-md mx-auto mb-6">
              Para poder utilizar el sistema y reservar turnos, tenés que completar tu ficha médica (Anamnesis) por única vez.
            </p>
            <Link 
              href="/onboarding" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-xl transition-all active:scale-95"
            >
              Completar Anamnesis
            </Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
