import { Suspense } from 'react';
import FitnessOnboardingGate from '@/components/fitness/FitnessOnboardingGate';
import TransformationPage from '@/components/fitness/TransformationPage';
import FitForgeShell from '@/components/fitforge/FitForgeShell';

export default function FitnessTransformationRoutePage() {
  return (
    <FitForgeShell>
      <FitnessOnboardingGate>
        <Suspense fallback={<TransformationPageSkeleton />}>
          <TransformationPage />
        </Suspense>
      </FitnessOnboardingGate>
    </FitForgeShell>
  );
}

function TransformationPageSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-pulse p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="h-48 rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="h-36 rounded-2xl bg-muted" />
          <div className="h-36 rounded-2xl bg-muted" />
          <div className="h-36 rounded-2xl bg-muted" />
          <div className="h-36 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
