'use client';

import type { ReactNode } from 'react';
import { useGetCodeSessionQuery } from '@/lib/services/codeApi';

type CodeModuleGateProps = {
  children: ReactNode;
};

export default function CodeModuleGate({ children }: CodeModuleGateProps) {
  const { isLoading, isError } = useGetCodeSessionQuery();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading code practice session...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-red-500">
        Could not start code practice session. Please log in again.
      </div>
    );
  }

  return children;
}
