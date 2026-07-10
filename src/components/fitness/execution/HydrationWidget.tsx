'use client';

import { Droplets } from 'lucide-react';
import CompletionRing from '@/components/fitness/execution/CompletionRing';

type HydrationWidgetProps = {
  amountMl: number;
  goalMl: number;
  isLogging?: boolean;
  onAdd: (amountMl: number) => void | Promise<boolean>;
  compact?: boolean;
};

const QUICK_ADDS = [250, 500, 750] as const;

export default function HydrationWidget({
  amountMl,
  goalMl,
  isLogging = false,
  onAdd,
  compact = false,
}: HydrationWidgetProps) {
  const liters = (amountMl / 1000).toFixed(1);
  const goalLiters = (goalMl / 1000).toFixed(1);

  if (compact) {
    return (
      <div className="fixed bottom-24 left-4 z-40 w-[min(100%-2rem,18rem)] rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur lg:hidden sm:left-auto sm:right-24">
        <div className="mb-2 flex items-center gap-2">
          <Droplets className="size-4 text-accent" />
          <p className="text-xs font-semibold text-foreground">
            {liters} / {goalLiters}L
          </p>
        </div>
        <div className="flex gap-1.5">
          {QUICK_ADDS.map((amount) => (
            <button
              key={amount}
              type="button"
              disabled={isLogging}
              onClick={() => void onAdd(amount)}
              className="flex-1 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted disabled:opacity-50"
            >
              +{amount}ml
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Droplets className="size-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Water Tracker</h3>
      </div>
      <div className="flex items-center gap-4">
        <CompletionRing
          value={amountMl / 1000}
          max={goalMl / 1000 || 3.5}
          size={88}
          label="L"
          sublabel={`${liters} / ${goalLiters}L`}
        />
        <div className="flex flex-1 flex-col gap-2">
          {QUICK_ADDS.map((amount) => (
            <button
              key={amount}
              type="button"
              disabled={isLogging}
              onClick={() => void onAdd(amount)}
              className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              +{amount}ml
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
