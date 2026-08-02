import { Suspense } from 'react';
import CareerModuleShell from '@/components/career/CareerModuleShell';
import CareerOnboardingGate from '@/components/career/CareerOnboardingGate';
import CareerShell from '@/components/career/CareerShell';
import CareerResumePage from '@/components/career/resume/CareerResumePage';

export default function CareerResumeRoutePage() {
  return (
    <CareerShell>
      <CareerOnboardingGate>
        <Suspense
          fallback={
            <CareerModuleShell activeNav="resume">
              <div className="h-64 animate-pulse rounded-2xl bg-muted" />
            </CareerModuleShell>
          }
        >
          <CareerResumePage />
        </Suspense>
      </CareerOnboardingGate>
    </CareerShell>
  );
}
