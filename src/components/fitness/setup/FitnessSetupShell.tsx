'use client';

import { Activity } from 'lucide-react';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import type { ReactNode } from 'react';
import { FITNESS_SETUP_STEPS } from '@/lib/fitness/constants';
import type { FitnessSetupStepId } from '@/lib/fitness/types';

type FitnessSetupShellProps = {
  currentStep: FitnessSetupStepId;
  progressPercent: number;
  children: ReactNode;
  footer: ReactNode;
};

export default function FitnessSetupShell({
  currentStep,
  progressPercent,
  children,
  footer,
}: FitnessSetupShellProps) {
  const currentStepIndex = FITNESS_SETUP_STEPS.findIndex(
    (step) => step.id === currentStep,
  );
  const setupStepNumber = Math.max(currentStepIndex, 1);
  const setupTotalSteps = FITNESS_SETUP_STEPS.length - 1;

  return (
    <FitnessModuleShell
      mode="setup"
      activeNav="setup"
      progressPercent={progressPercent}
      setupMeta={{
        step: setupStepNumber,
        total: setupTotalSteps,
      }}
      footer={footer}
    >
      <div className="mx-auto max-w-3xl">{children}</div>
    </FitnessModuleShell>
  );
}

export function SetupStepBadge({
  currentStep,
}: {
  currentStep: FitnessSetupStepId;
}) {
  const currentStepIndex = FITNESS_SETUP_STEPS.findIndex(
    (step) => step.id === currentStep,
  );
  const stepNumber = Math.max(currentStepIndex, 1);
  const totalSteps = FITNESS_SETUP_STEPS.length - 1;

  if (currentStep === 'welcome') return null;

  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
      Step {stepNumber} of {totalSteps}
    </p>
  );
}

export function SetupMobileHeader() {
  return (
    <div className="mb-6 flex items-center gap-2 lg:hidden">
      <Activity className="size-4 text-accent" />
      <p className="text-sm font-semibold text-foreground">Fitness Setup</p>
    </div>
  );
}
