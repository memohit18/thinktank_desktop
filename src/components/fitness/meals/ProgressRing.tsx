'use client';

type ProgressRingProps = {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  size?: number;
};

export default function ProgressRing({
  label,
  current,
  goal,
  unit = '',
  size = 96,
}: ProgressRingProps) {
  const percent =
    goal > 0 ? Math.min(100, Math.max(0, (current / goal) * 100)) : 0;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-accent transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-foreground">
            {Math.round(percent)}%
          </p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {Math.round(current)}
          {unit}
          {goal > 0 ? ` / ${Math.round(goal)}${unit}` : ''}
        </p>
      </div>
    </div>
  );
}
