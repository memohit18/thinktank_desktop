'use client';

import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';

export type ListCardOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

type ListCardSelectorProps<T extends string> = {
  value: T | '';
  options: ListCardOption<T>[];
  onChange: (value: T) => void;
  error?: string;
};

export default function ListCardSelector<T extends string>({
  value,
  options,
  onChange,
  error,
}: ListCardSelectorProps<T>) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
              isSelected
                ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_var(--neon-glow)]'
                : 'border-border bg-card hover:border-accent/30 hover:bg-muted/40'
            }`}
          >
            {Icon ? (
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  isSelected
                    ? 'bg-accent text-accent-foreground dark:text-black'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="size-5" />
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold ${
                  isSelected ? 'text-accent' : 'text-foreground'
                }`}
              >
                {option.label}
              </p>
              {option.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {option.description}
                </p>
              ) : null}
            </div>

            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                isSelected
                  ? 'border-accent bg-accent text-accent-foreground dark:text-black'
                  : 'border-border bg-background text-transparent'
              }`}
            >
              <Check className="size-3.5" />
            </span>
          </button>
        );
      })}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
