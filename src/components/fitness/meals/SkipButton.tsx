'use client';

import { Loader2 } from 'lucide-react';

type SkipButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
};

export default function SkipButton({
  disabled = false,
  isLoading = false,
  onClick,
}: SkipButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={onClick}
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : null}
      Skip
    </button>
  );
}
