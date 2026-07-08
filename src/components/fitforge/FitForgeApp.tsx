'use client';

import FitnessModulePage from '@/components/fitness/FitnessModulePage';
import FitForgeShell from '@/components/fitforge/FitForgeShell';

export default function FitForgeApp() {
  return (
    <FitForgeShell>
      <FitnessModulePage />
    </FitForgeShell>
  );
}
