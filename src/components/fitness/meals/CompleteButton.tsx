'use client';

import { Loader2 } from 'lucide-react';

type CompleteButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
};

export default function CompleteButton({
  disabled = false,
  isLoading = false,
  onClick,
}: CompleteButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={onClick}
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
    >
      {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : null}
      Complete
    </button>
  );
}
