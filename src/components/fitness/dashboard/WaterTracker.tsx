'use client';

import { Droplets } from 'lucide-react';
import CompletionRing from '@/components/fitness/execution/CompletionRing';
import type { DashboardWaterProgress } from '@/lib/fitness/dashboard/types';

type WaterTrackerProps = {
  water: DashboardWaterProgress;
  isLogging?: boolean;
  onAdd: (amountMl: number) => void | Promise<boolean>;
};

const QUICK_ADDS = [250, 500, 750] as const;

export default function WaterTracker({
  water,
  isLogging = false,
  onAdd,
}: WaterTrackerProps) {
  const liters = (water.currentMl / 1000).toFixed(1);
  const goalLiters = (water.goalMl / 1000).toFixed(1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Droplets className="size-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">
          Water Progress
        </h3>
      </div>
      <div className="flex items-center gap-4">
        <CompletionRing
          value={water.currentMl / 1000}
          max={Math.max(0.1, water.goalMl / 1000)}
          size={88}
          label="L"
          sublabel={`${liters} / ${goalLiters}L`}
        />
        <div className="flex-1 space-y-2">
          <p className="text-xs text-muted-foreground">
            {water.remainingMl > 0
              ? `${(water.remainingMl / 1000).toFixed(1)}L remaining`
              : 'Goal reached'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ADDS.map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={isLogging}
                onClick={() => void onAdd(amount)}
                className="rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                +{amount}ml
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
