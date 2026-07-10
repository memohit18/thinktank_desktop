'use client';

import { useMemo, useState } from 'react';
import type { ChartPoint } from '@/lib/fitness/progress/types';

type TrendChartProps = {
  title: string;
  subtitle?: string;
  points: ChartPoint[];
  unit?: string;
  emptyMessage?: string;
  accentClassName?: string;
};

export default function TrendChart({
  title,
  subtitle,
  points,
  unit = '',
  emptyMessage = 'No data points yet. Log progress to unlock this trend.',
}: TrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const geometry = useMemo(() => {
    if (points.length === 0) return null;
    const width = 320;
    const height = 140;
    const padX = 12;
    const padY = 16;
    const values = points.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const coords = points.map((point, index) => {
      const x =
        points.length === 1
          ? width / 2
          : padX + (index / (points.length - 1)) * (width - padX * 2);
      const y =
        height - padY - ((point.value - min) / range) * (height - padY * 2);
      return { x, y, point };
    });

    const line = coords
      .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`)
      .join(' ');

    const area = `${line} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;

    return { width, height, coords, line, area, min, max };
  }, [points]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      {!geometry ? (
        <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div>
          <svg
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            className="h-40 w-full"
            role="img"
            aria-label={title}
          >
            <path
              d={geometry.area}
              className="fill-accent/10"
            />
            <path
              d={geometry.line}
              className="stroke-accent"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {geometry.coords.map((coord, index) => (
              <circle
                key={`${coord.point.date}-${index}`}
                cx={coord.x}
                cy={coord.y}
                r={activeIndex === index ? 5 : 3.5}
                className="fill-accent stroke-background"
                strokeWidth="2"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            ))}
          </svg>

          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{points[0]?.label}</span>
            <span>
              {activeIndex != null
                ? `${points[activeIndex].label}: ${points[activeIndex].value}${unit}`
                : `${geometry.min}${unit} – ${geometry.max}${unit}`}
            </span>
            <span>{points[points.length - 1]?.label}</span>
          </div>
        </div>
      )}
    </section>
  );
}
