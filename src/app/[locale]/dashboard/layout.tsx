'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { TopNav } from '@/components/layout/top-nav';
import { Sidebar } from '@/components/layout/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const params = useParams();
  const locale = (params.locale as string) || 'de';

  // Mock user - in production this comes from auth
  const user = {
    name: 'Admin User',
    email: 'admin@ldb-dataguard.de',
    image: null,
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        user={user}
        locale={locale}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        locale={locale}
      />
      <main className="md:pl-64 pt-14">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
