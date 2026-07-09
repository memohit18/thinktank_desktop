type WeightComparisonProps = {
  currentWeightKg: number;
  targetWeightKg: number;
  estimatedWeeks: number;
};

export default function WeightComparison({
  currentWeightKg,
  targetWeightKg,
  estimatedWeeks,
}: WeightComparisonProps) {
  const delta = targetWeightKg - currentWeightKg;
  const weeklyChange = estimatedWeeks > 0 ? delta / estimatedWeeks : 0;
  const progress =
    delta === 0
      ? 0
      : Math.min(
          100,
          Math.max(0, ((currentWeightKg - targetWeightKg) / Math.abs(delta)) * 100),
        );

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Weight Progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current trajectory toward your target weight.
          </p>
        </div>
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500">
          {delta > 0 ? '+' : ''}
          {delta.toFixed(1)} kg projected
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <span className="text-muted-foreground">{currentWeightKg} kg start</span>
        <span className="text-accent">{targetWeightKg} kg goal</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">Currently</p>
          <p className="mt-1 text-xl font-bold text-foreground">{currentWeightKg} kg</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">Estimated weekly change</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {weeklyChange > 0 ? '+' : ''}
            {weeklyChange.toFixed(1)} kg / wk
          </p>
        </div>
      </div>
    </section>
  );
}
