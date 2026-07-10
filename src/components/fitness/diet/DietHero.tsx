'use client';

import { Download, History } from 'lucide-react';
import { formatGoalLabel } from '@/lib/fitness/diet/dietResponse';
import type { DietPlan, DietPlanner } from '@/lib/fitness/diet/types';
import RegenerateButton from '@/components/fitness/diet/RegenerateButton';

type DietHeroProps = {
  diet: DietPlan;
  planner?: DietPlanner | null;
  isRegenerating?: boolean;
  onRegenerate: () => void;
  onOpenHistory: () => void;
  onDownloadPdf: () => void;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-foreground">
        {value}
      </p>
    </div>
  );
}

export default function DietHero({
  diet,
  planner,
  isRegenerating = false,
  onRegenerate,
  onOpenHistory,
  onDownloadPdf,
}: DietHeroProps) {
  const label = planner?.label ?? diet.label;
  const phase = planner?.phase ?? diet.phase;
  const statusMessage = planner?.statusMessage ?? diet.statusMessage;
  const compliance = planner?.dietCompliance;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent/5" />
      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                AI Diet Planner
              </p>
              {diet.version ? (
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  v{diet.version}
                </span>
              ) : null}
              {label ? (
                <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {label}
                </span>
              ) : null}
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                {diet.status || 'ACTIVE'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {label || 'Your AI-Generated Diet Plan'}
              </h1>
              {phase ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-accent">
                  {phase}
                </p>
              ) : null}
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {statusMessage || (
                  <>
                    Optimized for{' '}
                    <span className="font-semibold capitalize text-foreground">
                      {formatGoalLabel(diet.goal)}
                    </span>{' '}
                    with balanced macros across your week.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <History className="size-3.5" />
              History
            </button>
            <RegenerateButton
              isLoading={isRegenerating}
              onClick={onRegenerate}
            />
            <button
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Download className="size-3.5" />
              PDF
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard label="Goal" value={formatGoalLabel(diet.goal)} />
          <StatCard
            label="Daily Calories"
            value={`${Math.round(diet.dailyCalories).toLocaleString()} kcal`}
          />
          <StatCard
            label="Daily Protein"
            value={`${Math.round(diet.dailyProtein)} g`}
          />
          <StatCard label="Frequency" value={`${diet.mealsPerDay} Meals`} />
          <StatCard label="Duration" value={`${diet.durationWeeks} Weeks`} />
          <StatCard
            label="Compliance"
            value={`${Math.round(compliance ?? 0)}%`}
          />
        </div>
      </div>
    </section>
  );
}
