'use client';

import type { InputHTMLAttributes } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function FormField({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        id={fieldId}
        className={`w-full rounded-xl border border-border bg-card px-4 py-3 text-base font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        {...props}
      />
      {hint ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
      {error ? <span className="mt-1.5 block text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

type FormTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  rows?: number;
};

export function FormTextarea({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  rows = 5,
}: FormTextareaProps) {
  const fieldId = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-accent">
        {label}
      </span>
      <textarea
        id={fieldId}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {hint ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
      {error ? <span className="mt-1.5 block text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

type FormSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
};

export function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
}: FormSelectProps) {
  const fieldId = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1.5 block text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

type GenderSegmentProps = {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
};

export function GenderSegment({
  value,
  options,
  onChange,
  error,
}: GenderSegmentProps) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Gender
      </span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                isSelected
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-card text-muted-foreground hover:border-accent/30 hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? <span className="mt-1.5 block text-xs text-red-500">{error}</span> : null}
    </div>
  );
}

type WeightSliderProps = {
  value: number | '';
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
};

export function WeightSlider({
  value,
  onChange,
  min = 40,
  max = 150,
  error,
}: WeightSliderProps) {
  const numericValue = typeof value === 'number' ? value : 75;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Weight
        </span>
        <span className="text-lg font-bold text-foreground">{numericValue} kg</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={numericValue}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-accent"
      />
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{min} kg</span>
        <span>{max} kg</span>
      </div>
      {error ? <span className="mt-1.5 block text-xs text-red-500">{error}</span> : null}
    </div>
  );
}

export function StepSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="transition-opacity duration-300">
      <div className="space-y-5">{children}</div>
    </section>
  );
}
