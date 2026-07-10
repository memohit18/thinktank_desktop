'use client';

import TrendChart from '@/components/fitness/progress/TrendChart';
import type { ChartPoint } from '@/lib/fitness/progress/types';

type WeightChartProps = {
  points: ChartPoint[];
};

export default function WeightChart({ points }: WeightChartProps) {
  return (
    <TrendChart
      title="Weight Trend"
      subtitle="Track how your body weight moves over time."
      points={points}
      unit=" kg"
    />
  );
}
