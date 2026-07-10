'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

type FitnessApiErrorStateProps = {
  title: string;
  message: string;
  isRetrying?: boolean;
  onRetry?: () => void;
};

export default function FitnessApiErrorState({
  title,
  message,
  isRetrying = false,
  onRetry,
}: FitnessApiErrorStateProps) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-12 text-center">
      <AlertCircle className="size-10 text-red-500" />
      <h2 className="mt-4 text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Retry
        </button>
      ) : null}
    </section>
  );
}
