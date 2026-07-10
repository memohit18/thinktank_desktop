'use client';

import { useMemo, useState } from 'react';
import TrendChart from '@/components/fitness/progress/TrendChart';
import type { ChartPoint, ProgressEntry } from '@/lib/fitness/progress/types';
import { toChartPoints } from '@/lib/fitness/progress/progressResponse';

type MeasurementKey = 'waistCm' | 'chestCm' | 'armCm' | 'thighCm';

type MeasurementChartProps = {
  entries: ProgressEntry[];
  trendPoints?: {
    waist: ChartPoint[];
    chest: ChartPoint[];
    arm: ChartPoint[];
    thigh: ChartPoint[];
  } | null;
};

const MEASUREMENT_OPTIONS: Array<{
  key: MeasurementKey;
  trendKey: 'waist' | 'chest' | 'arm' | 'thigh';
  label: string;
  unit: string;
}> = [
  { key: 'waistCm', trendKey: 'waist', label: 'Waist', unit: ' cm' },
  { key: 'chestCm', trendKey: 'chest', label: 'Chest', unit: ' cm' },
  { key: 'armCm', trendKey: 'arm', label: 'Arms', unit: ' cm' },
  { key: 'thighCm', trendKey: 'thigh', label: 'Thighs', unit: ' cm' },
];

export default function MeasurementChart({
  entries,
  trendPoints,
}: MeasurementChartProps) {
  const [selected, setSelected] = useState<MeasurementKey>('waistCm');
  const option = MEASUREMENT_OPTIONS.find((item) => item.key === selected);

  const points: ChartPoint[] = useMemo(() => {
    const fromAnalytics = option
      ? trendPoints?.[option.trendKey] ?? []
      : [];
    if (fromAnalytics.length > 0) return fromAnalytics;
    return toChartPoints(entries, selected);
  }, [entries, option, selected, trendPoints]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {MEASUREMENT_OPTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSelected(item.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              selected === item.key
                ? 'border-accent bg-accent text-accent-foreground dark:text-black'
                : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <TrendChart
        title="Measurement Trend"
        subtitle={`${option?.label ?? 'Measurement'} over time.`}
        points={points}
        unit={option?.unit ?? ' cm'}
      />
    </div>
  );
}
