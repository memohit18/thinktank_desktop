'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import CardSelector from '@/components/fitness/setup/CardSelector';
import { StepSection } from '@/components/fitness/setup/FormFields';
import { mapPhysiqueGoalToFitnessGoal } from '@/lib/fitness/goalFitnessMapper';
import type { FitnessSetupForm } from '@/hooks/useFitnessSetup';
import type { PhysiqueGoal } from '@/lib/fitness/types';

type GoalStepProps = {
  form: FitnessSetupForm;
  goals: PhysiqueGoal[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  error?: string;
};

export default function GoalStep({
  form,
  goals,
  isLoading,
  isError,
  onRetry,
  error,
}: GoalStepProps) {
  const { setValue, watch } = form;
  const physiqueGoalId = watch('physiqueGoalId');

  if (isLoading) {
    return (
      <StepSection>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="h-44 bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </StepSection>
    );
  }

  if (isError) {
    return (
      <StepSection>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <AlertCircle className="mx-auto size-8 text-red-500" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Unable to load fitness goals
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Could not reach `GET /api/fitness/goals`. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>
        </div>
      </StepSection>
    );
  }

  if (goals.length === 0) {
    return (
      <StepSection>
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm font-medium text-foreground">
            No fitness goals available yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The goals API returned an empty list. Please try again.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>
        </div>
      </StepSection>
    );
  }

  return (
    <StepSection>
      <CardSelector
        value={physiqueGoalId}
        variant="goal"
        options={goals.map((goal) => ({
          value: goal.id,
          label: goal.title,
          description: goal.description,
          imageUrl: goal.imageUrl,
        }))}
        error={error}
        onChange={(value) => {
          setValue('physiqueGoalId', value, {
            shouldDirty: true,
            shouldValidate: true,
          });
          setValue('fitnessGoal', mapPhysiqueGoalToFitnessGoal(value), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
    </StepSection>
  );
}
