'use client';

import { useMemo, useState } from 'react';
import FitnessApiErrorState from '@/components/fitness/FitnessApiErrorState';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import FloatingCoach from '@/components/fitness/coach/FloatingCoach';
import AnalyticsCards from '@/components/fitness/progress/AnalyticsCards';
import BodyFatChart from '@/components/fitness/progress/BodyFatChart';
import LoadingSkeleton from '@/components/fitness/progress/LoadingSkeleton';
import MeasurementChart from '@/components/fitness/progress/MeasurementChart';
import PhotoComparison from '@/components/fitness/progress/PhotoComparison';
import PhotoTimeline from '@/components/fitness/progress/PhotoTimeline';
import ProgressEntryDialog from '@/components/fitness/progress/ProgressEntryDialog';
import ProgressHero from '@/components/fitness/progress/ProgressHero';
import UploadPhotos from '@/components/fitness/progress/UploadPhotos';
import WeightChart from '@/components/fitness/progress/WeightChart';
import { useAddProgress } from '@/hooks/useAddProgress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useProgress } from '@/hooks/useProgress';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { toChartPoints } from '@/lib/fitness/progress/progressResponse';
import type { ProgressPhotoSet } from '@/lib/fitness/progress/types';

export default function ProgressPage() {
  const progress = useProgress();
  const analyticsState = useAnalytics();
  const photos = useProgressPhotos();
  const { save, uploadPhotoSet, removePhotoSet, isSaving, isUploading, isDeletingPhotos } =
    useAddProgress();

  const [entryOpen, setEntryOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<ProgressPhotoSet | null>(null);

  const analytics = analyticsState.analytics;
  const insights = analyticsState.insights;

  const weightPoints = useMemo(() => {
    if (analytics?.weightTrend?.length) return analytics.weightTrend;
    return toChartPoints(progress.entries, 'weightKg');
  }, [analytics?.weightTrend, progress.entries]);

  const bodyFatPoints = useMemo(() => {
    if (analytics?.bodyFatTrend?.length) return analytics.bodyFatTrend;
    return toChartPoints(progress.entries, 'bodyFatPercentage');
  }, [analytics?.bodyFatTrend, progress.entries]);

  const resolvedAnalytics = useMemo(() => {
    const latest = progress.latest;
    if (!analytics && !latest) return null;
    return {
      ...(analytics ?? {
        currentWeightKg: null,
        targetWeightKg: null,
        remainingWeightKg: null,
        startWeightKg: null,
        weightChangeKg: null,
        bodyFatChange: null,
        waistChangeCm: null,
        goalCompletionPercent: null,
        transformationPercent: null,
        weeklyAverageWeightChangeKg: null,
        consistencyPercent: null,
        compliancePercent: null,
        currentStreakDays: null,
        estimatedWeeksRemaining: null,
        etaWeeksDelta: null,
        weeksElapsed: null,
        plannedEtaWeeks: null,
        weightTrend: [],
        bodyFatTrend: [],
        measurementTrends: { waist: [], chest: [], arm: [], thigh: [] },
        insights: null,
        insightMessage: null,
      }),
      currentWeightKg: analytics?.currentWeightKg ?? latest?.weightKg ?? null,
      remainingWeightKg:
        analytics?.remainingWeightKg ??
        (analytics?.targetWeightKg != null &&
        (analytics?.currentWeightKg ?? latest?.weightKg) != null
          ? analytics.targetWeightKg -
            (analytics.currentWeightKg ?? latest?.weightKg ?? 0)
          : null),
      insightMessage:
        insights?.summary || analytics?.insightMessage || null,
      insights: insights ?? analytics?.insights ?? null,
    };
  }, [analytics, insights, progress.latest]);

  const isLoading =
    progress.isLoading && analyticsState.isLoading && !resolvedAnalytics;

  const isError =
    progress.isError &&
    analyticsState.isError &&
    progress.entries.length === 0 &&
    !resolvedAnalytics;

  const refetchAll = async () => {
    await Promise.all([
      progress.refetch(),
      analyticsState.refetch(),
      photos.refetch(),
    ]);
  };

  if (isLoading) {
    return (
      <FitnessModuleShell activeNav="progress">
        <LoadingSkeleton />
      </FitnessModuleShell>
    );
  }

  if (isError) {
    return (
      <FitnessModuleShell activeNav="progress">
        <FitnessApiErrorState
          title="Could not load progress"
          message="Progress analytics could not be loaded from the server. Retry when your connection is available."
          onRetry={() => void refetchAll()}
        />
      </FitnessModuleShell>
    );
  }

  return (
    <FitnessModuleShell activeNav="progress">
      <div className="space-y-6">
        <ProgressHero
          analytics={resolvedAnalytics}
          insights={insights}
          isRefreshing={
            progress.isFetching ||
            analyticsState.isFetching ||
            photos.isFetching
          }
          onRefresh={() => void refetchAll()}
          onAddProgress={() => setEntryOpen(true)}
        />

        <AnalyticsCards analytics={resolvedAnalytics} />

        <div className="grid gap-4 lg:grid-cols-2">
          <WeightChart points={weightPoints} />
          <BodyFatChart points={bodyFatPoints} />
        </div>

        <MeasurementChart
          entries={progress.entries}
          trendPoints={analytics?.measurementTrends}
        />

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Progress Photos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Weekly photo sets, timeline, and before/after comparison.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <UploadPhotos
              isUploading={isUploading}
              onUpload={async (files) => {
                const result = await uploadPhotoSet(files);
                if (result) await photos.refetch();
                return result;
              }}
            />
            <PhotoComparison photos={photos.photos} />
          </div>
          <PhotoTimeline
            photos={photos.photos}
            selectedId={selectedSet?.id}
            isDeleting={isDeletingPhotos}
            onSelect={setSelectedSet}
            onDelete={async (id) => {
              const ok = await removePhotoSet(id);
              if (ok) {
                if (selectedSet?.id === id) setSelectedSet(null);
                await photos.refetch();
              }
            }}
          />
        </section>

        <ProgressEntryDialog
          open={entryOpen}
          isSaving={isSaving}
          onClose={() => setEntryOpen(false)}
          onSave={async (payload) => {
            const result = await save(payload);
            if (result) await refetchAll();
            return result;
          }}
        />
      </div>
      <FloatingCoach />
    </FitnessModuleShell>
  );
}
