'use client';

import TrendChart from '@/components/fitness/progress/TrendChart';
import type { ChartPoint } from '@/lib/fitness/progress/types';

type BodyFatChartProps = {
  points: ChartPoint[];
};

export default function BodyFatChart({ points }: BodyFatChartProps) {
  return (
    <TrendChart
      title="Body Fat Trend"
      subtitle="Body fat percentage across your logged entries."
      points={points}
      unit="%"
    />
  );
}
