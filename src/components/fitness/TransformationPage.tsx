'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import BodyFatCard from '@/components/fitness/transformation/BodyFatCard';
import GenerateButton from '@/components/fitness/transformation/GenerateButton';
import LoadingSkeleton from '@/components/fitness/transformation/LoadingSkeleton';
import MetricCard from '@/components/fitness/transformation/MetricCard';
import NutritionCard from '@/components/fitness/transformation/NutritionCard';
import Timeline from '@/components/fitness/transformation/Timeline';
import TipsCard from '@/components/fitness/transformation/TipsCard';
import TransformationHero from '@/components/fitness/transformation/TransformationHero';
import WeightComparison from '@/components/fitness/transformation/WeightComparison';
import { useTransformation } from '@/hooks/useTransformation';
import { BODY_METRICS } from '@/lib/fitness/transformation/constants';
import { useGetFitnessProfileQuery } from '@/lib/services/fitnessApi';

export default function TransformationPage() {
  const {
    transformation,
    isLoading,
    isFetching,
    isError,
    isUsingFallback,
    isGenerating,
    hasTransformation,
    generate,
    regenerate,
    refetch,
  } = useTransformation();

  const { data: profile } = useGetFitnessProfileQuery();

  if (isLoading) {
    return (
      <FitnessModuleShell activeNav="transformation">
        <LoadingSkeleton />
      </FitnessModuleShell>
    );
  }

  return (
    <FitnessModuleShell activeNav="transformation">
      <div className="space-y-6">
        {isUsingFallback ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p>
                  {isError
                    ? 'Transformation data is unavailable right now. Showing zeros until the API responds.'
                    : 'No active transformation plan found. Showing zeros until you generate a plan.'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isError ? (
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                  >
                    <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
                ) : null}
                {!hasTransformation ? (
                  <GenerateButton
                    label="Generate Plan"
                    isLoading={isGenerating}
                    onClick={() => void generate()}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <TransformationHero
          transformation={transformation}
          isRegenerating={isGenerating}
          onRegenerate={() => void regenerate()}
          disableRegenerate={isUsingFallback && !hasTransformation}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {BODY_METRICS.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.getValue(transformation)}
              description={metric.description}
              icon={metric.icon}
              badge={metric.getBadge?.(transformation)}
            />
          ))}
        </section>

        <Timeline
          estimatedWeeks={transformation.estimatedWeeks}
          milestones={transformation.milestones}
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <WeightComparison
              currentWeightKg={transformation.currentWeightKg}
              targetWeightKg={transformation.targetWeightKg}
              estimatedWeeks={transformation.estimatedWeeks}
            />
            <BodyFatCard
              currentBodyFat={transformation.currentBodyFat}
              targetBodyFat={transformation.targetBodyFat}
            />
          </div>

          <div className="space-y-6">
            <NutritionCard
              transformation={transformation}
              workoutDaysPerWeek={profile?.workoutDaysPerWeek ?? 0}
            />
            <TipsCard />
          </div>
        </div>
      </div>
    </FitnessModuleShell>
  );
}
