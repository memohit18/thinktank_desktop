'use client';

import { AI_SUGGESTED_PROMPTS } from '@/lib/fitness/coach/constants';

type PromptSuggestionsProps = {
  prompts?: readonly string[];
  disabled?: boolean;
  compact?: boolean;
  onSelect: (prompt: string) => void;
};

export default function PromptSuggestions({
  prompts = AI_SUGGESTED_PROMPTS,
  disabled = false,
  compact = false,
  onSelect,
}: PromptSuggestionsProps) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {compact ? null : (
        <p className="text-sm text-muted-foreground">
          Ask about meals, workouts, macros, or travel days.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt)}
            className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-left text-xs font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
