'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, Dumbbell, Loader2 } from 'lucide-react';
import { hasCompletedFitnessOnboarding } from '@/lib/fitness/profileMapper';
import { useGetFitnessProfileQuery } from '@/lib/services/fitnessApi';

export default function FitnessModulePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetFitnessProfileQuery();

  const profileIsComplete = hasCompletedFitnessOnboarding(profile);

  useEffect(() => {
    if (isLoading) return;

    if (!profileIsComplete) {
      router.replace('/fitness/setup');
    }
  }, [isLoading, profileIsComplete, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profileIsComplete || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col p-6 lg:p-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Fitness
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Your fitness hub
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Onboarding is complete. Workouts, nutrition, and coaching features will
          appear here as they are added.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <HubCard
          title="Profile"
          description="Your baseline metrics and goals are saved."
          value={`${profile.weightKg} kg · ${profile.fitnessGoal.replace(/_/g, ' ')}`}
        />
        <HubCard
          title="Training"
          description="Workout planning is coming soon."
          value={`${profile.workoutDaysPerWeek} days / week`}
        />
        <HubCard
          title="Nutrition"
          description="Meal planning is coming soon."
          value={profile.dietType.replace(/_/g, ' ')}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Dumbbell className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Need to update your setup?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Revisit onboarding to adjust goals, diet, or physique targets.
              </p>
            </div>
          </div>
          <Link
            href="/fitness/setup?mode=edit"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Edit setup
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function HubCard({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <p className="mt-4 text-sm font-medium capitalize text-accent">{value}</p>
    </div>
  );
}
