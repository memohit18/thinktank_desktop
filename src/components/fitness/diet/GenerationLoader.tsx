'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Leaf, Loader2 } from 'lucide-react';
import { DIET_GENERATION_STEPS } from '@/lib/fitness/diet/constants';

type GenerationLoaderProps = {
  isComplete?: boolean;
  onViewPlan?: () => void;
};

export default function GenerationLoader({
  isComplete = false,
  onViewPlan,
}: GenerationLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      setStepIndex(DIET_GENERATION_STEPS.length - 1);
      return;
    }

    const stepTimer = window.setInterval(() => {
      setStepIndex((current) =>
        Math.min(current + 1, DIET_GENERATION_STEPS.length - 1),
      );
    }, 1400);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 4, 92));
    }, 280);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(progressTimer);
    };
  }, [isComplete]);

  if (isComplete) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground">Plan Ready!</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Your personalized 7-day culinary roadmap is generated.
        </p>
        <button
          type="button"
          onClick={onViewPlan}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-opacity hover:opacity-90 dark:text-black"
        >
          View My Diet Plan
        </button>
      </section>
    );
  }

  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
      <div className="relative flex size-16 items-center justify-center rounded-2xl bg-accent/15 text-accent">
        <Leaf className="size-8" />
        <Loader2 className="absolute -right-1 -top-1 size-5 animate-spin text-accent" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-foreground">
        Generating your diet plan
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {DIET_GENERATION_STEPS[stepIndex]}
      </p>

      <div className="mt-8 w-full max-w-md">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
