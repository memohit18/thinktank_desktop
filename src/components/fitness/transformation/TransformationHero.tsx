'use client';

import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import type { Transformation } from '@/lib/fitness/transformation/types';

type TransformationHeroProps = {
  transformation: Transformation;
  isRegenerating?: boolean;
  onRegenerate: () => void;
  disableRegenerate?: boolean;
};

function formatFocusLabel(transformation: Transformation) {
  if (transformation.targetPhysique) {
    return transformation.targetPhysique;
  }

  if (transformation.goal) {
    return transformation.goal.replace(/_/g, ' ').toLowerCase();
  }

  return 'your goal';
}

function formatWeight(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export default function TransformationHero({
  transformation,
  isRegenerating = false,
  onRegenerate,
  disableRegenerate = false,
}: TransformationHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent/5" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Current Focus
          </p>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Your Transformation Journey
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              AI has analyzed your profile and created your transformation roadmap.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold text-foreground sm:text-4xl">
              {formatWeight(transformation.currentWeightKg)} kg
            </p>
            <span className="pb-1 text-2xl text-muted-foreground">→</span>
            <p className="text-3xl font-bold text-accent sm:text-4xl">
              {formatWeight(transformation.targetWeightKg)} kg
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Estimated completion in{' '}
            <span className="font-semibold text-foreground">
              {transformation.estimatedWeeks || 0} weeks
            </span>{' '}
            based on your metabolism and{' '}
            <span className="capitalize">{formatFocusLabel(transformation)}</span> target.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating || disableRegenerate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRegenerating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Regenerate Plan
        </button>
      </div>

      <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        <Sparkles className="size-3.5" />
        Status: {transformation.status || 'UNAVAILABLE'}
      </div>
    </section>
  );
}
