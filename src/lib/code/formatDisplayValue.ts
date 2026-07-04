function prettyPrintJsonLikeLiteral(value: string) {
  const trimmed = value.trim();

  if (!(trimmed.startsWith('[') || trimmed.startsWith('{'))) {
    return value;
  }

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return value;
  }
}

export function formatDisplayValue(value: unknown) {
  if (value === undefined || value === null) {
    return '—';
  }

  if (typeof value !== 'string') {
    return JSON.stringify(value, null, 2);
  }

  const trimmed = value.trim();
  const assignmentIndex = trimmed.indexOf('=');

  if (assignmentIndex > 0) {
    const variableName = trimmed.slice(0, assignmentIndex).trim();
    const assignedValue = trimmed.slice(assignmentIndex + 1).trim();
    const prettyValue = prettyPrintJsonLikeLiteral(assignedValue);

    if (prettyValue !== assignedValue) {
      return `${variableName} = ${prettyValue}`;
    }
  }

  return prettyPrintJsonLikeLiteral(value);
}
