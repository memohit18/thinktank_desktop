'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type FinishWorkoutDialogProps = {
  open: boolean;
  remainingRequired: number;
  durationMinutes: number;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (force: boolean) => void | Promise<boolean>;
};

export default function FinishWorkoutDialog({
  open,
  remainingRequired,
  durationMinutes,
  isSubmitting = false,
  onClose,
  onConfirm,
}: FinishWorkoutDialogProps) {
  const [force, setForce] = useState(false);

  useEffect(() => {
    if (open) setForce(remainingRequired === 0);
  }, [open, remainingRequired]);

  if (!open) return null;

  const blocked = remainingRequired > 0 && !force;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close finish dialog"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Finish Workout
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Session duration about {durationMinutes} min.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {remainingRequired > 0 ? (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            {remainingRequired} exercise
            {remainingRequired === 1 ? '' : 's'} still incomplete. Skip them or
            force finish.
            <label className="mt-3 flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={force}
                onChange={(event) => setForce(event.target.checked)}
              />
              Force finish with incomplete exercises
            </label>
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">
            All exercises are complete or skipped. Ready to end the session.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || blocked}
            onClick={() => void onConfirm(force)}
            className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50 dark:text-black"
          >
            {isSubmitting ? 'Finishing…' : 'Finish Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}
