'use client';

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  disabled?: boolean;
  onChange: (value: T) => void;
  layout?: 'inline' | 'cards';
};

export default function SegmentedControl<T extends string>({
  value,
  options,
  disabled = false,
  onChange,
  layout = 'inline',
}: SegmentedControlProps<T>) {
  if (layout === 'cards') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isActive
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-muted/20 hover:bg-muted/40'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <p
                className={`text-sm font-semibold ${
                  isActive ? 'text-accent' : 'text-foreground'
                }`}
              >
                {option.label}
              </p>
              {option.hint ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.hint}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      className="inline-flex w-full gap-1 rounded-xl border border-border bg-muted/40 p-1"
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive
                ? 'bg-accent text-accent-foreground dark:text-black'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
