'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type MealNotesDialogProps = {
  open: boolean;
  mealName?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
};

export default function MealNotesDialog({
  open,
  mealName,
  isSubmitting = false,
  onClose,
  onSave,
}: MealNotesDialogProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close notes dialog"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Add Note</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {mealName
                ? `Optional note for ${mealName}`
                : 'Optional note for this meal'}
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

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Feeling full, swapped sides, etc."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSave(notes.trim())}
            className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-60 dark:text-black"
          >
            {isSubmitting ? 'Saving…' : 'Save & Mark Ate'}
          </button>
        </div>
      </div>
    </div>
  );
}
