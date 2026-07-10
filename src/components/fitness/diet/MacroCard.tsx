'use client';

import type { DietMacroProgress } from '@/lib/fitness/diet/types';

type MacroCardProps = {
  label: string;
  progress: DietMacroProgress;
  unit?: string;
  tone?: 'default' | 'accent';
};

export default function MacroCard({
  label,
  progress,
  unit = '',
  tone = 'default',
}: MacroCardProps) {
  const goal = progress.goal > 0 ? progress.goal : 0;
  const percent =
    goal > 0
      ? Math.min(100, Math.max(0, (progress.current / goal) * 100))
      : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(progress.current)}
          {unit}
          {goal > 0 ? ` / ${Math.round(goal)}${unit}` : ''}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            tone === 'accent' ? 'bg-accent' : 'bg-accent/80'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
