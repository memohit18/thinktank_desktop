'use client';

import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { useSidebar } from '@/providers/SidebarProvider';

export default function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pinned } = useSidebar();

  return (
    <div
      className={`min-h-screen bg-background transition-[padding] duration-200 ${
        pinned ? 'pl-64' : 'pl-[4.5rem]'
      }`}
    >
      <AppSidebar />
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        {children}
      </div>
    </div>
  );
}
