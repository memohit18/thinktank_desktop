'use client';

import type { DietTransformationSummary } from '@/lib/fitness/diet/types';

type TransformationCardProps = {
  transformation?: DietTransformationSummary | null;
};

export default function TransformationCard({
  transformation,
}: TransformationCardProps) {
  if (
    !transformation ||
    (transformation.currentWeightKg == null &&
      transformation.targetWeightKg == null &&
      transformation.estimatedWeeks == null)
  ) {
    return null;
  }

  const current = transformation.currentWeightKg;
  const target = transformation.targetWeightKg;
  const delta =
    current != null && target != null ? target - current : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Transformation
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground">Current</p>
          <p className="text-sm font-semibold text-foreground">
            {current != null ? `${current} kg` : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground">Target</p>
          <p className="text-sm font-semibold text-foreground">
            {target != null ? `${target} kg` : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground">ETA</p>
          <p className="text-sm font-semibold text-foreground">
            {transformation.estimatedWeeks != null
              ? `${transformation.estimatedWeeks} wk`
              : '—'}
          </p>
        </div>
      </div>
      {delta != null ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {delta >= 0 ? '+' : ''}
          {delta.toFixed(1)} kg to goal
        </p>
      ) : null}
    </section>
  );
}
