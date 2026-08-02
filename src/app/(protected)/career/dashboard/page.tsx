import { Suspense } from 'react';
import CareerModuleShell from '@/components/career/CareerModuleShell';
import CareerOnboardingGate from '@/components/career/CareerOnboardingGate';
import CareerShell from '@/components/career/CareerShell';
import CareerDashboardPage from '@/components/career/dashboard/CareerDashboardPage';

export default function CareerDashboardRoutePage() {
  return (
    <CareerShell>
      <CareerOnboardingGate>
        <Suspense
          fallback={
            <CareerModuleShell activeNav="dashboard">
              <div className="h-64 animate-pulse rounded-2xl bg-muted" />
            </CareerModuleShell>
          }
        >
          <CareerDashboardPage />
        </Suspense>
      </CareerOnboardingGate>
    </CareerShell>
  );
}
