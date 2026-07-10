'use client';

import { Loader2, RefreshCw } from 'lucide-react';

type RegenerateButtonProps = {
  isLoading?: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export default function RegenerateButton({
  isLoading = false,
  onClick,
  disabled = false,
}: RegenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <RefreshCw className="size-3.5" />
      )}
      Regenerate
    </button>
  );
}
