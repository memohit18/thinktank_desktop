import type { PhysiqueGoal } from '@/lib/fitness/types';

const PHYSIQUE_GOAL_FALLBACK_IMAGES: Record<string, string> = {
  athletic: '/fitness/physique/athletic.jpg',
  bodybuilder: '/fitness/physique/bodybuilder.jpg',
  lean: '/fitness/physique/lean.jpg',
  muscular: '/fitness/physique/muscular.jpg',
  powerlifter: '/fitness/physique/powerlifter.jpg',
  slim: '/fitness/physique/slim.jpg',
};

const DEFAULT_PHYSIQUE_IMAGE = '/fitness/physique/default.jpg';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function isUsableRemoteImageUrl(url: string) {
  if (!url || url === 'null' || url === 'undefined') {
    return false;
  }

  if (url.startsWith('/fitness/')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function resolveFallbackImage(slug: string, id: string) {
  return (
    PHYSIQUE_GOAL_FALLBACK_IMAGES[slug] ??
    PHYSIQUE_GOAL_FALLBACK_IMAGES[slugify(id)] ??
    DEFAULT_PHYSIQUE_IMAGE
  );
}

export function resolvePhysiqueGoalImage(goal: Pick<PhysiqueGoal, 'id' | 'title' | 'imageUrl'>) {
  const slug = slugify(goal.title || goal.id);
  const fallback = resolveFallbackImage(slug, goal.id);

  if (isUsableRemoteImageUrl(goal.imageUrl) && !goal.imageUrl.startsWith('/uploads')) {
    return goal.imageUrl;
  }

  return fallback;
}

export function normalizePhysiqueGoal(raw: unknown): PhysiqueGoal | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id = readString(record, ['id', 'slug', '_id']);
  if (!id) {
    return null;
  }

  const title = readString(record, ['title', 'name', 'label']) || 'Physique Goal';
  const description = readString(record, ['description', 'subtitle', 'summary']);
  const apiImageUrl = readString(record, [
    'imageUrl',
    'image_url',
    'image',
    'photoUrl',
    'photo_url',
    'thumbnailUrl',
    'thumbnail_url',
  ]);

  const goal = {
    id,
    title,
    description,
    imageUrl: apiImageUrl,
  };

  return {
    ...goal,
    imageUrl: resolvePhysiqueGoalImage(goal),
  };
}

export function normalizePhysiqueGoals(rawGoals: unknown[]): PhysiqueGoal[] {
  return rawGoals
    .map((goal) => normalizePhysiqueGoal(goal))
    .filter((goal): goal is PhysiqueGoal => goal !== null);
}

export function getPhysiqueGoalFallbackImage(label: string) {
  return resolveFallbackImage(slugify(label), label);
}
