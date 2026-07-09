'use client';

import { ArrowRight, CheckCircle2, Dumbbell, UtensilsCrossed } from 'lucide-react';

type SuccessStepProps = {
  onContinue: () => void;
};

export default function SuccessStep({ onContinue }: SuccessStepProps) {
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
          stats={[
            { label: 'Daily Target', value: 'Coming soon' },
            { label: 'Protein Goal', value: 'Coming soon' },
          ]}
          tone="accent"
        />
        <PlanCard
          icon={Dumbbell}
          title="Workout Plan"
          stats={[
            { label: 'Frequency', value: 'Coming soon' },
            { label: 'Focus Area', value: 'Coming soon' },
          ]}
          tone="neon"
        />
      </div>

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
  tone,
}: {
  icon: typeof UtensilsCrossed;
  title: string;
  stats: { label: string; value: string }[];
  tone: 'accent' | 'neon';
}) {
  const toneClass = tone === 'accent' ? 'text-accent' : 'text-accent';

  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-left">
      <div className="flex items-start justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl bg-accent/10 ${toneClass}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-4 space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{stat.label}</span>
            <span className={`font-semibold ${toneClass}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
