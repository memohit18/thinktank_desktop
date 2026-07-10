import { Suspense } from 'react';
import FitnessOnboardingGate from '@/components/fitness/FitnessOnboardingGate';
import MealsPage from '@/components/fitness/meals/MealsPage';
import FitForgeShell from '@/components/fitforge/FitForgeShell';

export default function FitnessMealsRoutePage() {
  return (
    <FitForgeShell>
      <FitnessOnboardingGate>
        <Suspense fallback={<MealsPageSkeleton />}>
          <MealsPage />
        </Suspense>
      </FitnessOnboardingGate>
    </FitForgeShell>
  );
}

function MealsPageSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-pulse p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="h-52 rounded-2xl bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <div className="h-12 rounded-full bg-muted" />
            <div className="h-36 rounded-2xl bg-muted" />
            <div className="h-36 rounded-2xl bg-muted" />
          </div>
          <div className="space-y-4">
            <div className="h-64 rounded-2xl bg-muted" />
            <div className="h-56 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
