import { Suspense } from 'react';
import FitnessSetupWizard from '@/components/fitness/setup/FitnessSetupWizard';
import FitForgeShell from '@/components/fitforge/FitForgeShell';

export default function FitnessSetupPage() {
  return (
    <FitForgeShell>
      <Suspense fallback={<SetupPageSkeleton />}>
        <FitnessSetupWizard />
      </Suspense>
    </FitForgeShell>
  );
}

function SetupPageSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-pulse">
      <div className="hidden w-56 border-r border-border bg-card/50 lg:block" />
      <div className="flex-1 space-y-6 p-8">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-3 w-full rounded-full bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
