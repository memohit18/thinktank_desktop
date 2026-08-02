import { Suspense } from 'react';
import CareerModuleShell from '@/components/career/CareerModuleShell';
import CareerShell from '@/components/career/CareerShell';
import CareerProfilePage from '@/components/career/profile/CareerProfilePage';

export default function CareerProfileRoutePage() {
  return (
    <CareerShell>
      <Suspense
        fallback={
          <CareerModuleShell activeNav="profile">
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          </CareerModuleShell>
        }
      >
        <CareerProfilePage />
      </Suspense>
    </CareerShell>
  );
}
