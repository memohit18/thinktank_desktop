import { Suspense } from 'react';
import FitnessOnboardingGate from '@/components/fitness/FitnessOnboardingGate';
import DashboardPage from '@/components/fitness/dashboard/DashboardPage';
import DashboardSkeleton from '@/components/fitness/dashboard/DashboardSkeleton';
import FitForgeShell from '@/components/fitforge/FitForgeShell';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';

export default function FitnessDashboardRoutePage() {
  return (
    <FitForgeShell>
      <FitnessOnboardingGate>
        <Suspense
          fallback={
            <FitnessModuleShell activeNav="dashboard">
              <DashboardSkeleton />
            </FitnessModuleShell>
          }
        >
          <DashboardPage />
        </Suspense>
      </FitnessOnboardingGate>
    </FitForgeShell>
  );
}
