'use client';

import { ArrowRight, CheckCircle2, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { useGetFitnessPlansQuery } from '@/lib/services/fitnessApi';

type SuccessStepProps = {
  onContinue: () => void;
};

export default function SuccessStep({ onContinue }: SuccessStepProps) {
  const plansQuery = useGetFitnessPlansQuery();
  const plans = plansQuery.data;

  const nutritionStats = [
    {
      label: 'Daily Target',
      value: plans?.nutrition?.dailyTarget || (plansQuery.isLoading ? '…' : '—'),
    },
    {
      label: 'Protein Goal',
      value: plans?.nutrition?.proteinGoal || (plansQuery.isLoading ? '…' : '—'),
    },
  ];

  const workoutStats = [
    {
      label: 'Frequency',
      value: plans?.workout?.frequency || (plansQuery.isLoading ? '…' : '—'),
    },
    {
      label: 'Focus Area',
      value: plans?.workout?.focusArea || (plansQuery.isLoading ? '…' : '—'),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl py-6 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent/15 text-accent shadow-[0_0_40px_var(--neon-glow)]">
        <CheckCircle2 className="size-10" />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
        Your personalized plan is ready!
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Our AI has processed your profile to generate bespoke nutrition and
        training recommendations tailored to your goals.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <PlanCard
          icon={UtensilsCrossed}
          title="Nutrition Plan"
          stats={nutritionStats}
          ready={plans?.nutrition?.ready}
        />
        <PlanCard
          icon={Dumbbell}
          title="Workout Plan"
          stats={workoutStats}
          ready={plans?.workout?.ready}
        />
      </div>

      {plansQuery.isError ? (
        <p className="mt-4 text-xs text-amber-700 dark:text-amber-300">
          Plan summary could not be loaded. You can still continue to your
          dashboard.
        </p>
      ) : null}

      <button
        type="button"
        onClick={onContinue}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-opacity hover:opacity-90 dark:text-black"
      >
        View My Dashboard
        <ArrowRight className="size-4" />
      </button>

      <p className="mt-4 text-xs text-muted-foreground">
        You can adjust these settings anytime in your profile.
      </p>
    </div>
  );
}

function PlanCard({
  icon: Icon,
  title,
  stats,
  ready,
}: {
  icon: typeof UtensilsCrossed;
  title: string;
  stats: { label: string; value: string }[];
  ready?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-left">
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon className="size-5" />
        </div>
        {ready ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
            Ready
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-4 space-y-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-muted-foreground">{stat.label}</span>
            <span className="font-semibold text-accent">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
