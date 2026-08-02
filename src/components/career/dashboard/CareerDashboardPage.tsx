'use client';

import { Loader2 } from 'lucide-react';
import CareerApiErrorState from '@/components/career/CareerApiErrorState';
import CareerModuleShell from '@/components/career/CareerModuleShell';
import { useCareerDashboard } from '@/hooks/useCareerDashboard';

export default function CareerDashboardPage() {
  const { dashboard, roleLabels, isLoading, isError, refetch } =
    useCareerDashboard();

  if (isLoading) {
    return (
      <CareerModuleShell activeNav="dashboard">
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </CareerModuleShell>
    );
  }

  if (isError && !dashboard) {
    return (
      <CareerModuleShell activeNav="dashboard">
        <CareerApiErrorState
          title="Could not load career dashboard"
          message="Career status could not be loaded. Retry when your connection is available."
          onRetry={() => void refetch()}
        />
      </CareerModuleShell>
    );
  }

  const data = dashboard ?? {
    status: 'ACTIVE' as const,
    defaultResumeTitle: null,
    preferredRoles: [],
    preferredSalaryLabel: null,
    autoApply: false,
  };

  return (
    <CareerModuleShell activeNav="dashboard">
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Career status
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A simple snapshot of your profile readiness. Job listings will
            appear here later.
          </p>
        </header>

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <StatusRow label="Career Status" value={data.status} emphasize />
          <StatusRow
            label="Default Resume"
            value={data.defaultResumeTitle ?? 'Not set'}
          />
          <StatusRow
            label="Preferred Roles"
            value={
              roleLabels.length > 0
                ? roleLabels.join(', ')
                : 'None selected'
            }
          />
          <StatusRow
            label="Preferred Salary"
            value={data.preferredSalaryLabel ?? 'Not set'}
          />
          <StatusRow
            label="Auto Apply"
            value={data.autoApply ? 'Enabled' : 'Disabled'}
          />
        </div>
      </div>
    </CareerModuleShell>
  );
}

function StatusRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={`text-sm font-semibold sm:text-right ${
          emphasize ? 'text-accent' : 'text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
