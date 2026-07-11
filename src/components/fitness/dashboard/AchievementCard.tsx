'use client';

import { Award, CheckCircle2, Circle } from 'lucide-react';
import type { DashboardAchievement } from '@/lib/fitness/dashboard/types';

type AchievementCardProps = {
  achievement: DashboardAchievement;
};

export default function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        achievement.unlocked
          ? 'border-accent/40 bg-accent/10'
          : 'border-border bg-card opacity-70'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-xl p-2 ${
            achievement.unlocked
              ? 'bg-accent/20 text-accent'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Award className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">
              {achievement.title}
            </h4>
            {achievement.unlocked ? (
              <CheckCircle2 className="size-3.5 shrink-0 text-accent" />
            ) : (
              <Circle className="size-3.5 shrink-0 text-muted-foreground" />
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {achievement.description}
          </p>
          {achievement.unlocked && achievement.unlockedAt ? (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Unlocked {achievement.unlockedAt}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
