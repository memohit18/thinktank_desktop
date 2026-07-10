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
        <div className="mt-6 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center text-sm text-muted-foreground">
          No body fat data available for this plan.
        </div>
      </section>
    );
  }

  const current = hasCurrent ? currentBodyFat : null;
  const target = hasTarget ? targetBodyFat : null;
  const reduction =
    current !== null && target !== null ? current - target : null;
  const progress =
    reduction === null || current === null || current <= 0
      ? 0
      : reduction <= 0
        ? 100
        : Math.min(100, Math.max(0, (target! / current) * 100));

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
          {hasCurrent ? (
            <>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--accent) ${progress}%, var(--muted) ${progress}% 100%)`,
                }}
              />
              <div className="relative flex size-28 flex-col items-center justify-center rounded-full bg-card">
                <p className="text-2xl font-bold text-foreground">{current}%</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Current
                </p>
              </div>
            </>
          ) : (
            <div className="flex size-28 flex-col items-center justify-center rounded-full border border-dashed border-border bg-muted/20">
              <p className="text-sm font-semibold text-muted-foreground">—</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Current
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fat mass reduction</span>
              <span className="font-semibold text-foreground">
                {reduction !== null ? `${reduction.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              {reduction !== null ? (
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${Math.min(100, Math.max(8, Math.abs(reduction) * 4))}%`,
                  }}
                />
              ) : null}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lean mass retention</span>
              <span className="font-semibold text-foreground">—</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </section>
  );
}
