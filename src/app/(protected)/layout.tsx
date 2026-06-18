'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { getAccessToken } from '@/lib/auth/cookies';
import { isAccessTokenValid } from '@/lib/auth/token';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!isAccessTokenValid(accessToken)) {
      router.replace('/');
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pl-64">
      <AppSidebar />
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        {children}
      </div>
    </div>
  );
}
