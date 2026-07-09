'use client';

import BodyFatCard from '@/components/fitness/transformation/BodyFatCard';
import NutritionCard from '@/components/fitness/transformation/NutritionCard';
import MetricCard from '@/components/fitness/transformation/MetricCard';
import Timeline from '@/components/fitness/transformation/Timeline';
import TipsCard from '@/components/fitness/transformation/TipsCard';
import TransformationHero from '@/components/fitness/transformation/TransformationHero';
import TransformationHistorySection from '@/components/fitness/transformation/TransformationHistorySection';
import WeightComparison from '@/components/fitness/transformation/WeightComparison';
import { BODY_METRICS } from '@/lib/fitness/transformation/constants';
import type {
  Transformation,
  TransformationHistoryItem,
  TransformationHistoryMeta,
} from '@/lib/fitness/transformation/types';

type TransformationDashboardProps = {
  transformation: Transformation;
  history: TransformationHistoryItem[];
  historyMeta?: TransformationHistoryMeta;
  isHistoryLoading?: boolean;
  workoutDaysPerWeek?: number;
  isRegenerating?: boolean;
  onRegenerate: () => void;
};

export default function TransformationDashboard({
  transformation,
  history,
  historyMeta,
  isHistoryLoading = false,
  workoutDaysPerWeek = 0,
  isRegenerating = false,
  onRegenerate,
}: TransformationDashboardProps) {
  return (
    <div className="space-y-6">
      <TransformationHero
        transformation={transformation}
        isRegenerating={isRegenerating}
        onRegenerate={onRegenerate}
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
            workoutDaysPerWeek={workoutDaysPerWeek}
          />
          <TipsCard />
        </div>
      </div>

      <TransformationHistorySection
        items={history}
        meta={historyMeta}
        activeId={transformation.id}
        isLoading={isHistoryLoading}
      />
    </div>
  );
}
