'use client';

import type { ReactNode } from 'react';
import { useSettings } from '@/providers/SettingsProvider';

type FitForgeShellProps = {
  children: ReactNode;
};

export default function FitForgeShell({ children }: FitForgeShellProps) {
  const { isModuleEnabled } = useSettings();

  if (!isModuleEnabled('fitforge')) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Fitness module is disabled. Enable it in Settings → Modules.
        </p>
      </div>
    );
  }

  return <div className="min-w-0 flex-1">{children}</div>;
}
