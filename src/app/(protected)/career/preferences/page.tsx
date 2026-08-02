import { Suspense } from 'react';
import CareerModuleShell from '@/components/career/CareerModuleShell';
import CareerOnboardingGate from '@/components/career/CareerOnboardingGate';
import CareerShell from '@/components/career/CareerShell';
import CareerPreferencesPage from '@/components/career/preferences/CareerPreferencesPage';

export default function CareerPreferencesRoutePage() {
  return (
    <CareerShell>
      <CareerOnboardingGate>
        <Suspense
          fallback={
            <CareerModuleShell activeNav="preferences">
              <div className="h-64 animate-pulse rounded-2xl bg-muted" />
            </CareerModuleShell>
          }
        >
          <CareerPreferencesPage />
        </Suspense>
      </CareerOnboardingGate>
    </CareerShell>
  );
}
