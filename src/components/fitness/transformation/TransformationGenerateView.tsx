'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Calculator,
  Route,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import GenerateButton from '@/components/fitness/transformation/GenerateButton';
import type { FitnessProfile } from '@/lib/fitness/types';
import { buildFitnessReviewSectionsFromProfile } from '@/lib/fitness/reviewLabels';

type TransformationGenerateViewProps = {
  profile?: FitnessProfile | null;
  isGenerating?: boolean;
  onGenerate: () => void;
};

const PLAN_FEATURES = [
  {
    icon: Calculator,
    title: 'Metabolic targets',
    description:
      'BMI, BMR, TDEE, daily calories, and protein calculated from your profile.',
  },
  {
    icon: Route,
    title: 'Milestone roadmap',
    description:
      'Week-by-week weight and body-fat checkpoints through your transformation.',
  },
  {
    icon: Target,
    title: 'Physique-aligned plan',
    description:
      'Targets tuned to your physique goal and estimated completion timeline.',
  },
  {
    icon: TrendingUp,
    title: 'Trackable progress',
    description:
      'Active plan on the dashboard with history of past transformations.',
  },
] as const;

function formatGoal(value?: string | null) {
  if (!value) return '—';
  return value.replace(/_/g, ' ');
}

export default function TransformationGenerateView({
  profile,
  isGenerating = false,
  onGenerate,
}: TransformationGenerateViewProps) {
  const reviewSections = profile
    ? buildFitnessReviewSectionsFromProfile(profile)
    : [];
  const basicInfo = reviewSections.find((section) => section.id === 'basic-info');
  const goalInfo = reviewSections.find((section) => section.id === 'goal');

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Transformation Engine
          </p>
          <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            Generate your AI transformation plan
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We&apos;ll analyze your saved fitness profile to build a personalized
            roadmap with calories, protein, milestones, and an estimated
            completion timeline.
          </p>
        </div>
      </section>

      {profile ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Your profile inputs
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                Ready to generate from saved data
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These values from your fitness profile power the transformation
                calculation.
              </p>
            </div>
            <Link
              href="/fitness/setup?mode=edit"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              Edit profile
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {basicInfo?.items.map((item) => (
              <ProfileChip key={item.label} label={item.label} value={item.value} />
            ))}
            <ProfileChip
              label="Physique goal"
              value={
                profile.physiqueGoal?.title ??
                goalInfo?.items[0]?.value ??
                '—'
              }
            />
            <ProfileChip
              label="Training focus"
              value={formatGoal(profile.fitnessGoal)}
            />
            <ProfileChip
              label="Activity"
              value={formatGoal(profile.activityLevel)}
            />
            {profile.targetWeightKg ? (
              <ProfileChip
                label="Target weight"
                value={`${profile.targetWeightKg} kg`}
              />
            ) : null}
            {profile.targetBodyFatPercent ? (
              <ProfileChip
                label="Target body fat"
                value={`${profile.targetBodyFatPercent}%`}
              />
            ) : null}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <p className="text-sm font-medium text-foreground">
            Complete your fitness profile before generating a plan.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            We need age, weight, goals, and training preferences to calculate
            your transformation.
          </p>
          <Link
            href="/fitness/setup"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground dark:text-black"
          >
            Complete onboarding
            <ArrowRight className="size-4" />
          </Link>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {PLAN_FEATURES.map((feature) => {
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

      <section className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Sparkles className="size-8" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-foreground">
          No active transformation plan
        </h2>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          Generate your first plan to unlock the dashboard with live metrics,
          milestone timeline, and nutrition targets. Regenerating archives the
          current plan into your history.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <GenerateButton
            label="Generate Transformation Plan"
            isLoading={isGenerating}
            onClick={onGenerate}
          />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="size-3.5" />
            Uses your active fitness profile via authenticated API
          </p>
        </div>
      </section>
    </div>
  );
}

function ProfileChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
