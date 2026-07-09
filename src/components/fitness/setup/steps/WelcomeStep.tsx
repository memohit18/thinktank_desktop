'use client';

import { Brain, LineChart, Sparkles } from 'lucide-react';
import { FITNESS_ONBOARDING_BENEFITS } from '@/lib/fitness/constants';

export default function WelcomeStep() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent/10" />
        <div className="relative flex min-h-[12rem] flex-col justify-end p-6 sm:min-h-[14rem] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            AI-Powered Fitness
          </p>
          <h2 className="mt-2 max-w-lg text-2xl font-bold text-foreground sm:text-3xl">
            Elite Performance,{' '}
            <span className="text-accent">Tailored by AI.</span>
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FeatureCard
          icon={Sparkles}
          title="Adaptive AI Plans"
          description="Meals and workouts evolve with your progress."
        />
        <FeatureCard
          icon={LineChart}
          title="Clinical Analytics"
          description="Macro and training targets grounded in your metrics."
        />
      </div>

      <ul className="space-y-2.5">
        {FITNESS_ONBOARDING_BENEFITS.map((benefit) => (
          <li
            key={benefit}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-foreground"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Brain className="size-3.5" />
            </span>
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
