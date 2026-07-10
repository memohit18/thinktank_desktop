'use client';

type RestTimerProps = {
  secondsLeft: number;
  onSkip?: () => void;
};

export default function RestTimer({ secondsLeft, onSkip }: RestTimerProps) {
  if (secondsLeft <= 0) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">
          Rest Timer
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>
      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
        >
          Skip Rest
        </button>
      ) : null}
    </div>
  );
}
