import type { QuestionStatus } from '@/lib/code/questions';

const STORAGE_KEY = 'thinktank-problem-progress';

export type ProgressMap = Record<string, QuestionStatus>;

function readProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

function writeProgress(map: ProgressMap) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getProblemStatus(slug: string): QuestionStatus {
  return readProgress()[slug] ?? 'not_started';
}

export function getAllProgress(): ProgressMap {
  return readProgress();
}

export function setProblemStatus(slug: string, status: QuestionStatus) {
  const map = readProgress();
  map[slug] = status;
  writeProgress(map);
}

export function mergeStatus<T extends { slug: string; status?: QuestionStatus }>(
  items: T[],
): (T & { status: QuestionStatus })[] {
  const map = readProgress();
  return items.map((item) => ({
    ...item,
    status: map[item.slug] ?? item.status ?? 'not_started',
  }));
}

export function countSolved(): number {
  return Object.values(readProgress()).filter((s) => s === 'solved').length;
}
