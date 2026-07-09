'use client';

import { FITNESS_SETUP_STEPS } from '@/lib/fitness/constants';
import type { FitnessSetupStepId } from '@/lib/fitness/types';

type FitnessStepperProps = {
  currentStep: FitnessSetupStepId;
  onStepClick?: (step: FitnessSetupStepId) => void;
};

export default function FitnessStepper({
  currentStep,
  onStepClick,
}: FitnessStepperProps) {
  const currentIndex = FITNESS_SETUP_STEPS.findIndex(
    (step) => step.id === currentStep,
  );

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {FITNESS_SETUP_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isComplete = index < currentIndex;
        const isClickable = Boolean(onStepClick) && index <= currentIndex;

        return (
          <li key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => onStepClick?.(step.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-accent bg-accent/10 text-accent'
                  : isComplete
                    ? 'border-accent/30 bg-accent/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground'
              } ${isClickable ? 'hover:border-accent/50' : 'cursor-default'}`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive || isComplete
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </span>
              <span className="hidden sm:inline">{step.shortLabel}</span>
            </button>
            {index < FITNESS_SETUP_STEPS.length - 1 ? (
              <span
                aria-hidden
                className="hidden h-px w-4 bg-border sm:block"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
