import { Suspense } from 'react';
import FitnessOnboardingGate from '@/components/fitness/FitnessOnboardingGate';
import FoodPreferencesPage from '@/components/fitness/food-preferences/FoodPreferencesPage';
import LoadingSkeleton from '@/components/fitness/food-preferences/LoadingSkeleton';
import FitForgeShell from '@/components/fitforge/FitForgeShell';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';

export default function FoodPreferencesRoutePage() {
  return (
    <FitForgeShell>
      <FitnessOnboardingGate>
        <Suspense
          fallback={
            <FitnessModuleShell activeNav="nutrition">
              <LoadingSkeleton />
            </FitnessModuleShell>
          }
        >
          <FoodPreferencesPage />
        </Suspense>
      </FitnessOnboardingGate>
    </FitForgeShell>
  );
}
