'use client';

import ProgressRing from '@/components/fitness/meals/ProgressRing';
import type { DashboardMacro } from '@/lib/fitness/dashboard/types';

type MacroSummaryProps = {
  calories: DashboardMacro;
  protein: DashboardMacro;
};

export default function MacroSummary({ calories, protein }: MacroSummaryProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Calories & Protein
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Remaining macros for today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ProgressRing
          label="Calories"
          current={calories.current}
          goal={calories.goal}
          unit=" kcal"
        />
        <ProgressRing
          label="Protein"
          current={protein.current}
          goal={protein.goal}
          unit="g"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Remaining cal
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {Math.round(calories.remaining)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Remaining protein
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {Math.round(protein.remaining)}g
          </p>
        </div>
      </div>
    </section>
  );
}
