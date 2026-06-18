'use client';

import type { SelectHTMLAttributes } from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
};

export default function Select({
  value,
  onChange,
  options,
  className = '',
  disabled,
  id,
  ...rest
}: SelectProps) {
  return (
    <div className={`relative inline-flex min-w-[10rem] max-w-full ${className}`}>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-border bg-background py-2 pl-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
