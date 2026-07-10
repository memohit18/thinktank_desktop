import { Trophy } from 'lucide-react';
import type { TransformationMilestone } from '@/lib/fitness/transformation/types';

type TimelineProps = {
  estimatedWeeks: number;
  milestones?: TransformationMilestone[];
};

type TimelineItem = {
  week: number;
  label: string;
  targetWeightKg?: number;
  status?: string;
};

function buildTimelineItems(
  estimatedWeeks: number,
  milestones: TransformationMilestone[] = [],
): TimelineItem[] {
  const items: TimelineItem[] = [{ week: 1, label: 'Kickoff' }];

  for (const milestone of milestones) {
    items.push({
      week: milestone.weekNumber,
      label: `Week ${milestone.weekNumber}`,
      targetWeightKg: milestone.targetWeightKg,
      status: milestone.status,
    });
  }

  if (estimatedWeeks > 0 && !items.some((item) => item.week === estimatedWeeks)) {
    items.push({ week: estimatedWeeks, label: 'Goal' });
  }

  return items.sort((a, b) => a.week - b.week);
}

function resolveCurrentWeek(milestones: TransformationMilestone[], estimatedWeeks: number) {
  const pending = milestones.find((milestone) => milestone.status === 'pending');
  if (pending) {
    return pending.weekNumber;
  }

  if (milestones.length > 0) {
    return milestones[0].weekNumber;
  }

  if (estimatedWeeks <= 0) {
    return 0;
  }

  return Math.min(Math.max(Math.round(estimatedWeeks * 0.33), 1), estimatedWeeks);
}

export default function Timeline({ estimatedWeeks, milestones = [] }: TimelineProps) {
  if (estimatedWeeks <= 0 && milestones.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Phase Timeline</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Milestones will appear once your transformation plan is available.
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            No timeline data
          </span>
        </div>
        <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
          Milestones will appear once your transformation plan includes a timeline.
        </div>
      </section>
    );
  }

  const items = buildTimelineItems(estimatedWeeks, milestones);
  const currentWeek = resolveCurrentWeek(milestones, estimatedWeeks);

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Phase Timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your projected transformation milestones.
          </p>
        </div>
        <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          Week {currentWeek} active
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[640px] items-center justify-between gap-2">
          {items.map((milestone, index) => {
            const isGoal = milestone.label === 'Goal';
            const isCurrent = milestone.week === currentWeek;
            const isComplete = milestone.week < currentWeek;

            return (
              <div key={`${milestone.week}-${milestone.label}`} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border-2 ${
                      isCurrent
                        ? 'border-accent bg-accent text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] dark:text-black'
                        : isComplete
                          ? 'border-accent/60 bg-accent/20 text-accent'
                          : 'border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    {isGoal ? (
                      <Trophy className="size-4" />
                    ) : (
                      <span className="text-xs font-bold">{milestone.week}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">{milestone.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {milestone.targetWeightKg
                        ? `${milestone.targetWeightKg} kg`
                        : `Week ${milestone.week}`}
                    </p>
                  </div>
                </div>

                {index < items.length - 1 ? (
                  <div
                    className={`mx-2 h-0.5 flex-1 rounded-full ${
                      milestone.week < currentWeek ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
