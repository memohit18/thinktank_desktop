'use client';

import { Loader2, Sparkles } from 'lucide-react';

type GenerateButtonProps = {
  label?: string;
  isLoading?: boolean;
  onClick: () => void;
};

export default function GenerateButton({
  label = 'Generate Plan',
  isLoading = false,
  onClick,
}: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-black"
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      {label}
    </button>
  );
}
