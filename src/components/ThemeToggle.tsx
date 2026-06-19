'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const themes = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
] as const;

type ThemeToggleProps = {
  variant?: 'default' | 'sidebar';
  collapsed?: boolean;
};

export default function ThemeToggle({
  variant = 'default',
  collapsed = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className={
          variant === 'sidebar'
            ? 'h-10 w-full rounded-xl bg-muted'
            : 'h-9 w-[120px] rounded-lg border border-border bg-muted'
        }
      />
    );
  }

  const displayTheme =
    theme === 'system'
      ? ((resolvedTheme ?? 'light') as 'light' | 'dark')
      : ((theme ?? 'light') as 'light' | 'dark');

  if (variant === 'sidebar') {
    return (
      <div
        role="group"
        aria-label="Theme"
        className={`relative z-0 flex w-full gap-1 rounded-xl bg-muted p-1 ${
          collapsed ? 'flex-col' : ''
        }`}
      >
        {themes.map((option) => {
          const isActive = displayTheme === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={isActive}
              title={option.label}
              className={`flex min-h-9 items-center justify-center rounded-lg transition-colors ${
                collapsed ? 'px-2 py-2' : 'min-h-9 flex-1 gap-1.5 px-2 py-2'
              } text-xs font-medium ${
                isActive
                  ? 'bg-accent text-accent-foreground dark:text-black'
                  : 'text-sidebar-text hover:bg-card hover:text-sidebar-text-hover'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? (
                <span className="truncate">{option.label}</span>
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
      aria-label="Theme"
      className="inline-flex shrink-0 rounded-lg border border-border bg-muted p-1"
    >
      {themes.map((option) => {
        const isActive = displayTheme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={isActive}
            title={option.label}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="size-3.5" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className ?? 'size-4'}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className ?? 'size-4'}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
