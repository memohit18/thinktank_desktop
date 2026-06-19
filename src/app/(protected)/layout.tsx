'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedShell from '@/components/layout/ProtectedShell';
import { useAuth } from '@/providers/AuthProvider';
import SettingsProvider from '@/providers/SettingsProvider';
import SidebarProvider from '@/providers/SidebarProvider';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return (
    <SettingsProvider>
      <SidebarProvider>
        <ProtectedShell>{children}</ProtectedShell>
      </SidebarProvider>
    </SettingsProvider>
  );
}
