import { Suspense } from 'react';
import FitnessOnboardingGate from '@/components/fitness/FitnessOnboardingGate';
import WorkoutPage from '@/components/fitness/workout/WorkoutPage';
import FitForgeShell from '@/components/fitforge/FitForgeShell';

export default function FitnessWorkoutRoutePage() {
  return (
    <FitForgeShell>
      <FitnessOnboardingGate>
        <Suspense
          fallback={
            <div className="flex min-h-[calc(100vh-4rem)] animate-pulse p-8">
              <div className="mx-auto w-full max-w-6xl space-y-6">
                <div className="h-40 rounded-2xl bg-muted" />
                <div className="h-72 rounded-2xl bg-muted" />
              </div>
            </div>
          }
        >
          <WorkoutPage />
        </Suspense>
      </FitnessOnboardingGate>
    </FitForgeShell>
  );
}
