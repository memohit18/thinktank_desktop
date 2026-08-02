'use client';

import type { ReactNode } from 'react';
import { useSettings } from '@/providers/SettingsProvider';

type CareerShellProps = {
  children: ReactNode;
};

export default function CareerShell({ children }: CareerShellProps) {
  const { isModuleEnabled } = useSettings();

  if (!isModuleEnabled('career')) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Career module is disabled. Enable it in Settings → Modules.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}
