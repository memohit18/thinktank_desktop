'use client';

type RepInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function RepInput({
  value,
  onChange,
  disabled = false,
}: RepInputProps) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Reps
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none ring-accent focus:ring-2 disabled:opacity-50"
        placeholder="0"
      />
    </label>
  );
}
