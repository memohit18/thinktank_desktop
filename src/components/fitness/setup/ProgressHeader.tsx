'use client';

import { FITNESS_STEP_META } from '@/lib/fitness/stepMeta';
import type { FitnessSetupStepId } from '@/lib/fitness/types';
import { SetupStepBadge } from '@/components/fitness/setup/FitnessSetupShell';

type ProgressHeaderProps = {
  currentStep: FitnessSetupStepId;
};

export default function ProgressHeader({ currentStep }: ProgressHeaderProps) {
  const meta = FITNESS_STEP_META[currentStep];

  return (
    <header className="mb-8">
      <SetupStepBadge currentStep={currentStep} />
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {meta.title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {meta.subtitle}
      </p>
    </header>
  );
}
