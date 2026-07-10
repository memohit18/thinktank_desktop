'use client';

import { ArrowRight, Leaf, Sparkles, UtensilsCrossed } from 'lucide-react';
import GenerateButton from '@/components/fitness/transformation/GenerateButton';

type DietGenerateViewProps = {
  isGenerating?: boolean;
  onGenerate: () => void;
};

const FEATURES = [
  {
    icon: UtensilsCrossed,
    title: '7-day meal roadmap',
    description: 'Breakfast through dinner mapped to your preferences and macros.',
  },
  {
    icon: Leaf,
    title: 'Macro-balanced plates',
    description: 'Calories, protein, carbs, and fats aligned to your transformation goal.',
  },
  {
    icon: Sparkles,
    title: 'Grocery-ready plan',
    description: 'Preview top ingredients and estimated weekly cost for shopping.',
  },
] as const;

export default function DietGenerateView({
  isGenerating = false,
  onGenerate,
}: DietGenerateViewProps) {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Phase 4 · AI Diet Planner
          </p>
          <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            Generate your personalized diet plan
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We&apos;ll use your fitness profile, food preferences, and nutrition
            settings to build a weekly meal plan with macros and grocery guidance.
          </p>
          <div className="mt-6">
            <GenerateButton
              label={isGenerating ? 'Generating...' : 'Generate Diet Plan'}
              isLoading={isGenerating}
              onClick={onGenerate}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card/60 p-5"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-muted/20 p-6">
        <p className="text-sm font-medium text-foreground">
          No active diet plan yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a plan to unlock your weekly meals, nutrition summary, and grocery preview.
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline disabled:opacity-60"
        >
          Start generation
          <ArrowRight className="size-4" />
        </button>
      </section>
    </div>
  );
}
