export function formatMetricValue(
  value: number | null | undefined,
  formatter: (value: number) => string = String,
) {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) {
    return '—';
  }

  return formatter(value);
}
