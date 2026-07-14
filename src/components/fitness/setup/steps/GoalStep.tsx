'use client';

import { useState } from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import CardSelector from '@/components/fitness/setup/CardSelector';
import PhysiqueGoalFormModal from '@/components/fitness/setup/PhysiqueGoalFormModal';
import { StepSection } from '@/components/fitness/setup/FormFields';
import { useToast } from '@/components/ui/Toast';
import { useExclusiveAction } from '@/hooks/useExclusiveAction';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { mapPhysiqueGoalToFitnessGoal } from '@/lib/fitness/goalFitnessMapper';
import type { FitnessSetupForm } from '@/hooks/useFitnessSetup';
import type {
  CreatePhysiqueGoalPayload,
  PhysiqueGoal,
} from '@/lib/fitness/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCreateFitnessGoalMutation,
  useUpdateFitnessGoalMutation,
} from '@/lib/services/fitnessApi';

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
  const isAdmin = useIsAdmin();
  const { showToast } = useToast();
  const { runExclusive, isLocked } = useExclusiveAction({ cooldownMs: 500 });
  const [createGoal, createState] = useCreateFitnessGoalMutation();
  const [updateGoal, updateState] = useUpdateFitnessGoalMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [imageGoal, setImageGoal] = useState<PhysiqueGoal | null>(null);

  const isSubmitting =
    isLocked || createState.isLoading || updateState.isLoading;

  async function handleCreate(payload: CreatePhysiqueGoalPayload) {
    const result = await runExclusive(async () => {
      try {
        const created = await createGoal(payload).unwrap();
        showToast(`Goal “${created.title}” created.`);
        setValue('physiqueGoalId', created.id, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue('fitnessGoal', mapPhysiqueGoalToFitnessGoal(created.id), {
          shouldDirty: true,
          shouldValidate: true,
        });
        return true;
      } catch (err) {
        showToast(getApiErrorMessage(err, 'Failed to create goal.'), 'error');
        return false;
      }
    });
    return result ?? false;
  }

  async function handleUpdateImage(payload: CreatePhysiqueGoalPayload) {
    if (!imageGoal) return false;
    const result = await runExclusive(async () => {
      try {
        await updateGoal({
          goalId: imageGoal.id,
          body: { imageUrl: payload.imageUrl ?? null },
        }).unwrap();
        showToast(`Updated image for “${imageGoal.title}”.`);
        return true;
      } catch (err) {
        showToast(getApiErrorMessage(err, 'Failed to update goal image.'), 'error');
        return false;
      }
    });
    return result ?? false;
  }

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

  return (
    <StepSection>
      {isAdmin ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Plus className="size-4" />
            Add goal
          </button>
        </div>
      ) : null}

      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm font-medium text-foreground">
            No fitness goals available yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAdmin
              ? 'Create the first physique goal to get started.'
              : 'The goals API returned an empty list. Please try again.'}
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground dark:text-black"
            >
              <Plus className="size-4" />
              Add goal
            </button>
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <RefreshCw className="size-4" />
              Retry
            </button>
          )}
        </div>
      ) : (
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
          onEditImage={
            isAdmin
              ? (goalId) => {
                  const match = goals.find((goal) => goal.id === goalId) ?? null;
                  setImageGoal(match);
                }
              : undefined
          }
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
      )}

      <PhysiqueGoalFormModal
        open={createOpen}
        mode="create"
        isSubmitting={isSubmitting}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <PhysiqueGoalFormModal
        open={Boolean(imageGoal)}
        mode="image"
        goal={imageGoal}
        isSubmitting={isSubmitting}
        onClose={() => setImageGoal(null)}
        onSubmit={handleUpdateImage}
      />
    </StepSection>
  );
}
