'use client';

import CompletionRing from '@/components/fitness/execution/CompletionRing';

type ScoreRingProps = {
  score: number | null;
  size?: number;
  sublabel?: string;
};

export default function ScoreRing({
  score,
  size = 120,
  sublabel = 'Today',
}: ScoreRingProps) {
  return (
    <CompletionRing
      value={score ?? 0}
      max={100}
      size={size}
      label="score"
      sublabel={sublabel}
    />
  );
}
