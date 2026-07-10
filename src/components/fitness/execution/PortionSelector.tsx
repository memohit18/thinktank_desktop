'use client';

type PortionSelectorProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const PORTIONS = [
  { label: '¼', value: 0.25 },
  { label: '½', value: 0.5 },
  { label: '¾', value: 0.75 },
  { label: 'Full', value: 1 },
] as const;

export default function PortionSelector({
  value,
  onChange,
  disabled = false,
}: PortionSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PORTIONS.map((portion) => {
        const active = value === portion.value;
        return (
          <button
            key={portion.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(portion.value)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50 ${
              active
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
            }`}
          >
            {portion.label}
          </button>
        );
      })}
    </div>
  );
}
