'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type { AddProgressPayload } from '@/lib/fitness/progress/types';

type ProgressEntryDialogProps = {
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: AddProgressPayload) => Promise<unknown>;
};

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs text-muted-foreground">
      {label}
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
      />
    </label>
  );
}

export default function ProgressEntryDialog({
  open,
  isSaving = false,
  onClose,
  onSave,
}: ProgressEntryDialogProps) {
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [armCm, setArmCm] = useState('');
  const [thighCm, setThighCm] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const parseOptional = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Close progress entry dialog"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Add Progress
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              One entry per day — today&apos;s log will be upserted.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Weight (kg)" value={weightKg} onChange={setWeightKg} />
            <Field
              label="Body Fat (%)"
              value={bodyFatPercentage}
              onChange={setBodyFatPercentage}
            />
            <Field label="Waist (cm)" value={waistCm} onChange={setWaistCm} />
            <Field label="Chest (cm)" value={chestCm} onChange={setChestCm} />
            <Field label="Arm (cm)" value={armCm} onChange={setArmCm} />
            <Field label="Thigh (cm)" value={thighCm} onChange={setThighCm} />
          </div>
          <label className="block text-xs text-muted-foreground">
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
              placeholder="Feeling strong"
            />
          </label>
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              void onSave({
                weightKg: parseOptional(weightKg),
                bodyFatPercentage: parseOptional(bodyFatPercentage),
                waistCm: parseOptional(waistCm),
                chestCm: parseOptional(chestCm),
                armCm: parseOptional(armCm),
                thighCm: parseOptional(thighCm),
                notes: notes.trim() || undefined,
              }).then((result) => {
                if (result) {
                  setWeightKg('');
                  setBodyFatPercentage('');
                  setWaistCm('');
                  setChestCm('');
                  setArmCm('');
                  setThighCm('');
                  setNotes('');
                  onClose();
                }
              });
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] disabled:opacity-60 dark:text-black"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
