'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CareerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/career/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
