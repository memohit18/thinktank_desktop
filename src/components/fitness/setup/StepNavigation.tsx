'use client';

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

type StepNavigationProps = {
  showPrevious?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
};

export default function StepNavigation({
  showPrevious = true,
  showNext = true,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  isNextDisabled = false,
  isSubmitting = false,
  onPrevious,
  onNext,
}: StepNavigationProps) {
  return (
    <div className="shrink-0 border-t border-border bg-card/80 px-4 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        {showPrevious ? (
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex min-w-[7.5rem] items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            {previousLabel}
          </button>
        ) : (
          <div className="min-w-[7.5rem]" />
        )}

        {showNext ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled || isSubmitting}
            className="inline-flex min-w-[7.5rem] items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {nextLabel}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
