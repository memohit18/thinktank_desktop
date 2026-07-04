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
      className={`h-screen overflow-hidden bg-background transition-[padding] duration-200 ${
        pinned ? 'pl-64' : 'pl-18'
      }`}
    >
      <AppSidebar />
      <div className="flex h-screen min-h-0 flex-col overflow-hidden">
        <AppHeader />
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
