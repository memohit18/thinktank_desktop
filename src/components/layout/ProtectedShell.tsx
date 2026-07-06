'use client';

import { usePathname } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { useSidebar } from '@/providers/SidebarProvider';

function isFixedViewportRoute(pathname: string) {
  return /^\/code\/[^/]+$/.test(pathname);
}

export default function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pinned } = useSidebar();
  const pathname = usePathname();
  const fixedViewport = isFixedViewportRoute(pathname);

  return (
    <div
      className={`bg-background transition-[padding] duration-200 ${
        fixedViewport ? 'h-screen overflow-hidden' : 'min-h-screen'
      } ${pinned ? 'pl-64' : 'pl-18'}`}
    >
      <AppSidebar />
      <div
        className={`flex flex-col ${
          fixedViewport ? 'h-screen min-h-0 overflow-hidden' : 'min-h-screen'
        }`}
      >
        <AppHeader />
        <div
          className={
            fixedViewport ? 'min-h-0 flex-1 overflow-hidden' : 'flex-1'
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
