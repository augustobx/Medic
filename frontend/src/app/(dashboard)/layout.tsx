'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import TopBar from '@/components/layout/TopBar';
import { AuthProvider } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-surface-950">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Nav */}
        <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          <TopBar
            title="MedicTurn"
            onMenuToggle={() => setMobileNavOpen(true)}
          />
          <div className="flex-1 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
