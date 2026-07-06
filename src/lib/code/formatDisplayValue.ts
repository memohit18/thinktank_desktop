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

function splitTopLevelAssignments(value: string) {
  const trimmed = value.trim();
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];

    if (char === '[' || char === '{' || char === '(') {
      depth += 1;
    } else if (char === ']' || char === '}' || char === ')') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      const part = trimmed.slice(start, index).trim();
      if (part) parts.push(part);
      start = index + 1;
    }
  }

  const last = trimmed.slice(start).trim();
  if (last) parts.push(last);

  return parts.length > 0 ? parts : [trimmed];
}

function formatSingleAssignment(assignment: string) {
  const assignmentIndex = assignment.indexOf('=');

  if (assignmentIndex > 0) {
    const variableName = assignment.slice(0, assignmentIndex).trim();
    const assignedValue = assignment.slice(assignmentIndex + 1).trim();
    const prettyValue = prettyPrintJsonLikeLiteral(assignedValue);

    return `${variableName} = ${prettyValue}`;
  }

  return prettyPrintJsonLikeLiteral(assignment);
}

export function formatDisplayValue(value: unknown) {
  if (value === undefined || value === null) {
    return '—';
  }

  if (typeof value !== 'string') {
    return JSON.stringify(value, null, 2);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '—';
  }

  const assignments = splitTopLevelAssignments(trimmed);

  if (assignments.length > 1) {
    return assignments.map(formatSingleAssignment).join('\n');
  }

  return formatSingleAssignment(trimmed);
}
