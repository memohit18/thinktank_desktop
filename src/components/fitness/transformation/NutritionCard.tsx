import { CalendarDays } from 'lucide-react';
import { NUTRITION_SUMMARY_ITEMS } from '@/lib/fitness/transformation/constants';
import type { Transformation } from '@/lib/fitness/transformation/types';

type NutritionCardProps = {
  transformation: Transformation;
  workoutDaysPerWeek?: number;
};

export default function NutritionCard({
  transformation,
  workoutDaysPerWeek,
}: NutritionCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Daily Quota</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nutrition and training targets for this phase.
        </p>
      </div>

      <div className="space-y-3">
        {NUTRITION_SUMMARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-accent">
                {item.getValue(transformation)}
              </span>
            </div>
          );
        })}

        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <CalendarDays className="size-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Workout Days</span>
          </div>
          <span className="text-sm font-semibold text-accent">
            {workoutDaysPerWeek && workoutDaysPerWeek > 0
              ? `${workoutDaysPerWeek} / week`
              : '—'}
          </span>
        </div>
      </div>
    </section>
  );
}
