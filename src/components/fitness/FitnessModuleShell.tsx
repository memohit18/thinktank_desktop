'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { User } from 'lucide-react';
import {
  FITNESS_MODULE_NAV_ITEMS,
  FITNESS_SETUP_NAV_ITEMS,
  type FitnessModuleNavId,
} from '@/lib/fitness/navConfig';

type FitnessModuleShellProps = {
  children: ReactNode;
  activeNav?: FitnessModuleNavId;
  mode?: 'default' | 'setup';
  setupMeta?: {
    step: number;
    total: number;
  };
  footer?: ReactNode;
  progressPercent?: number;
};

export default function FitnessModuleShell({
  children,
  activeNav = 'transformation',
  mode = 'default',
  setupMeta,
  footer,
  progressPercent,
}: FitnessModuleShellProps) {
  const pathname = usePathname();
  const navItems =
    mode === 'setup' ? FITNESS_SETUP_NAV_ITEMS : FITNESS_MODULE_NAV_ITEMS;

  const resolvedActiveNav =
    mode === 'setup'
      ? 'setup'
      : pathname.startsWith('/fitness/setup')
        ? 'setup'
        : activeNav;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/50 p-4 lg:flex">
        <div className="mb-8">
          <p className="text-lg font-bold text-accent">Fitness</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {mode === 'setup' ? 'Setup Mode' : 'Transformation Engine'}
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === resolvedActiveNav;

            if (item.disabled) {
              return (
                <span
                  key={item.id}
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
                >
                  <Icon className="size-4" />
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] dark:text-black'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-accent">
              <User className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {mode === 'setup' ? 'Onboarding' : 'Active Plan'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {mode === 'setup' && setupMeta
                  ? `Step ${setupMeta.step} of ${setupMeta.total}`
                  : 'AI transformation roadmap'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {typeof progressPercent === 'number' ? (
          <div className="h-1 overflow-hidden bg-muted">
            <div
              className="h-full bg-gradient-to-r from-accent via-accent/70 to-accent transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}
