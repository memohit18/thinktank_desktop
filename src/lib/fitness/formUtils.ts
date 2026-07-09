export function parseFormNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? '' : parsed;
}
