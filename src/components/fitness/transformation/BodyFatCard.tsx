type BodyFatCardProps = {
  currentBodyFat: number | null;
  targetBodyFat: number | null;
};

export default function BodyFatCard({
  currentBodyFat,
  targetBodyFat,
}: BodyFatCardProps) {
  const hasCurrent = typeof currentBodyFat === 'number' && currentBodyFat > 0;
  const hasTarget = typeof targetBodyFat === 'number' && targetBodyFat > 0;

  if (!hasCurrent && !hasTarget) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Body Fat Analysis</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
          <div className="relative mx-auto flex size-36 items-center justify-center">
            <div className="relative flex size-28 flex-col items-center justify-center rounded-full border border-border bg-muted/20">
              <p className="text-2xl font-bold text-foreground">0%</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fat mass reduction</span>
                <span className="font-semibold text-foreground">0%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lean mass retention</span>
                <span className="font-semibold text-foreground">0%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const current = hasCurrent ? currentBodyFat : 0;
  const target = hasTarget ? targetBodyFat : 0;
  const reduction = current - target;
  const progress =
    reduction <= 0 || current <= 0
      ? 100
      : Math.min(100, Math.max(0, (target / current) * 100));

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Body Fat Analysis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current body fat versus your transformation target.
          </p>
        </div>
        {hasTarget ? (
          <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            Target: {target}%
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
        <div className="relative mx-auto flex size-36 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(var(--accent) ${progress}%, var(--muted) ${progress}% 100%)`,
            }}
          />
          <div className="relative flex size-28 flex-col items-center justify-center rounded-full bg-card">
            <p className="text-2xl font-bold text-foreground">{current}%</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fat mass reduction</span>
              <span className="font-semibold text-foreground">
                {hasCurrent && hasTarget ? `${reduction.toFixed(1)}%` : 'Tracking via weight'}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, Math.max(8, Math.abs(reduction) * 4))}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lean mass retention</span>
              <span className="font-semibold text-foreground">98% preserved</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[98%] rounded-full bg-accent/70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
