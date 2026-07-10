import { Suspense } from 'react';
import FitnessOnboardingGate from '@/components/fitness/FitnessOnboardingGate';
import ProgressPage from '@/components/fitness/progress/ProgressPage';
import FitForgeShell from '@/components/fitforge/FitForgeShell';

export default function FitnessProgressRoutePage() {
  return (
    <FitForgeShell>
      <FitnessOnboardingGate>
        <Suspense fallback={<ProgressPageSkeleton />}>
          <ProgressPage />
        </Suspense>
      </FitnessOnboardingGate>
    </FitForgeShell>
  );
}

function ProgressPageSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-pulse p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="h-56 rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-56 rounded-2xl bg-muted" />
          <div className="h-56 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
