'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Sparkles } from 'lucide-react';
import ReviewCard from '@/components/fitness/setup/ReviewCard';
import { getPhysiqueGoalFallbackImage } from '@/lib/fitness/physiqueGoalMapper';
import { buildFitnessReviewSectionsFromProfile } from '@/lib/fitness/reviewLabels';
import type { FitnessProfile } from '@/lib/fitness/types';

type FitnessProfileViewProps = {
  profile: FitnessProfile;
  onEdit: () => void;
};

function formatDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FitnessProfileView({
  profile,
  onEdit,
}: FitnessProfileViewProps) {
  const sections = buildFitnessReviewSectionsFromProfile(profile);
  const updatedLabel = formatDate(profile.updatedAt);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Fitness Profile
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Your saved fitness profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Onboarding is complete. Your metrics and goals are synced from the
            backend and power your transformation plan.
          </p>
          {updatedLabel ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Last updated {updatedLabel}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/fitness/transformation"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Sparkles className="size-4 text-accent" />
            View transformation
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] transition-opacity hover:opacity-90 dark:text-black"
          >
            <Pencil className="size-4" />
            Edit profile
          </button>
        </div>
      </header>

      {profile.physiqueGoal ? (
        <PhysiqueGoalHero profile={profile} />
      ) : null}

      <section className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {section.title}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <ReviewCard
                  key={`${section.id}-${item.label}`}
                  title={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function PhysiqueGoalHero({ profile }: { profile: FitnessProfile }) {
  const physiqueGoal = profile.physiqueGoal;
  const [imageSrc, setImageSrc] = useState(
    physiqueGoal?.imageUrl ?? getPhysiqueGoalFallbackImage(physiqueGoal?.title ?? 'default'),
  );

  if (!physiqueGoal) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <div className="relative aspect-[4/5] min-h-[220px] bg-muted md:min-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={physiqueGoal.title}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => {
              const fallback = getPhysiqueGoalFallbackImage(physiqueGoal.title);
              if (imageSrc !== fallback) {
                setImageSrc(fallback);
              }
            }}
          />
        </div>
        <div className="flex flex-col justify-center p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Physique goal
          </p>
          <h2 className="mt-2 text-xl font-bold text-foreground">
            {physiqueGoal.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {physiqueGoal.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1 capitalize text-foreground">
              {profile.fitnessGoal.replace(/_/g, ' ')}
            </span>
            {profile.targetWeightKg ? (
              <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-foreground">
                Target {profile.targetWeightKg} kg
              </span>
            ) : null}
            {profile.targetBodyFatPercent ? (
              <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-foreground">
                Target {profile.targetBodyFatPercent}% body fat
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}