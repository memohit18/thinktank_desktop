'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import ImageUrlField from '@/components/images/ImageUrlField';
import { FormField } from '@/components/fitness/setup/FormFields';
import type {
  CreatePhysiqueGoalPayload,
  PhysiqueGoal,
} from '@/lib/fitness/types';

type PhysiqueGoalFormModalProps = {
  open: boolean;
  mode: 'create' | 'image';
  goal?: PhysiqueGoal | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePhysiqueGoalPayload) => Promise<boolean>;
};

type FormState = {
  title: string;
  description: string;
  imageUrl: string;
  targetBodyFatMin: string;
  targetBodyFatMax: string;
};

const EMPTY: FormState = {
  title: '',
  description: '',
  imageUrl: '',
  targetBodyFatMin: '',
  targetBodyFatMax: '',
};

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function PhysiqueGoalFormModal({
  open,
  mode,
  goal = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: PhysiqueGoalFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (goal) {
      setForm({
        title: goal.title,
        description: goal.description,
        imageUrl: goal.imageUrl ?? '',
        targetBodyFatMin:
          goal.targetBodyFatMin != null ? String(goal.targetBodyFatMin) : '',
        targetBodyFatMax:
          goal.targetBodyFatMax != null ? String(goal.targetBodyFatMax) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [open, goal]);

  if (!open) return null;

  const isImageOnly = mode === 'image';
  const title = isImageOnly ? 'Update goal image' : 'Add fitness goal';
  const description = isImageOnly
    ? 'Pick an uploaded image and size to update this goal.'
    : 'Create a new physique goal for the fitness setup.';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!isImageOnly && !form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.imageUrl.trim() && isImageOnly) {
      setError('Choose an image first.');
      return;
    }

    const payload: CreatePhysiqueGoalPayload = isImageOnly
      ? {
          title: goal?.title ?? '',
          description: goal?.description ?? '',
          imageUrl: form.imageUrl.trim() || null,
        }
      : {
          title: form.title.trim(),
          description: form.description.trim(),
          imageUrl: form.imageUrl.trim() || null,
          targetBodyFatMin: toOptionalNumber(form.targetBodyFatMin) ?? null,
          targetBodyFatMax: toOptionalNumber(form.targetBodyFatMax) ?? null,
        };

    const ok = await onSubmit(payload);
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close goal dialog"
        className="absolute inset-0 cursor-default"
        disabled={isSubmitting}
        onClick={isSubmitting ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          {!isImageOnly ? (
            <>
              <FormField
                label="Title"
                value={form.title}
                disabled={isSubmitting}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="e.g. Lean"
                required
              />
              <FormField
                label="Description"
                value={form.description}
                disabled={isSubmitting}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="e.g. Visible abs, low body fat"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Body fat min %"
                  type="number"
                  min={0}
                  max={60}
                  step="0.1"
                  value={form.targetBodyFatMin}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetBodyFatMin: event.target.value,
                    }))
                  }
                  placeholder="10"
                />
                <FormField
                  label="Body fat max %"
                  type="number"
                  min={0}
                  max={60}
                  step="0.1"
                  value={form.targetBodyFatMax}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetBodyFatMax: event.target.value,
                    }))
                  }
                  placeholder="14"
                />
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-foreground">
              {goal?.title}
            </p>
          )}

          <ImageUrlField
            label="Goal image"
            value={form.imageUrl || null}
            disabled={isSubmitting}
            uploadType="physique"
            pickerTitle="Choose goal image"
            pickerDescription="Pick an uploaded image, then choose a size"
            onChange={(imageUrl) =>
              setForm((current) => ({ ...current, imageUrl: imageUrl ?? '' }))
            }
          />

          {error ? <p className="text-xs text-red-500">{error}</p> : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50 dark:text-black"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isImageOnly ? 'Save image' : 'Create goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
