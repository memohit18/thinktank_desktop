import {
  isFitnessErrorEnvelope,
  unwrapFitnessData,
} from '@/lib/fitness/fitnessResponse';
import type {
  ImageVariantFormat,
  ImageVariants,
  UserImage,
  UserImagesResponse,
} from '@/lib/images/types';

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapVariant(raw: unknown): ImageVariantFormat | null {
  const record = asRecord(raw);
  if (!record) return null;
  const webp = readString(record.webp);
  const jpeg = readString(record.jpeg);
  const avif = readString(record.avif);
  if (!webp && !jpeg && !avif) return null;
  return {
    webp,
    jpeg,
    avif,
    width: readNumber(record.width),
    height: readNumber(record.height),
    bytes: readNumber(record.bytes),
  };
}

function unwrapVariants(raw: unknown): ImageVariants | null {
  const record = asRecord(raw);
  if (!record) return null;
  const original = unwrapVariant(record.original);
  const thumbnail = unwrapVariant(record.thumbnail);
  const small = unwrapVariant(record.small);
  const medium = unwrapVariant(record.medium);
  const large = unwrapVariant(record.large);
  if (!original || !thumbnail || !small || !medium || !large) return null;
  return { original, thumbnail, small, medium, large };
}

export function unwrapUserImage(raw: unknown): UserImage | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = readString(record.id);
  const variants = unwrapVariants(record.images);
  if (!id || !variants) return null;

  return {
    id,
    userId: readString(record.userId),
    type: readString(record.type, 'profile'),
    originalFileName: readString(record.originalFileName, 'image'),
    folderPath: readString(record.folderPath),
    blurDataUrl: readString(record.blurDataUrl) || null,
    images: variants,
    createdAt: readString(record.createdAt) || new Date().toISOString(),
    updatedAt: readString(record.updatedAt) || new Date().toISOString(),
  };
}

export function unwrapUserImages(response: unknown): UserImagesResponse {
  if (isFitnessErrorEnvelope(response)) {
    return {
      items: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }

  const data = unwrapFitnessData(response);
  const record = asRecord(data);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(record?.items)
      ? record.items
      : [];

  const metaRecord = asRecord(record?.meta);
  const items = list
    .map((item) => unwrapUserImage(item))
    .filter((item): item is UserImage => Boolean(item));

  return {
    items,
    meta: {
      page: readNumber(metaRecord?.page, 1),
      limit: readNumber(metaRecord?.limit, 20),
      total: readNumber(metaRecord?.total, items.length),
      totalPages: readNumber(metaRecord?.totalPages, 1),
    },
  };
}

export function formatImageBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** POST /images may return the image directly or nested under data. */
export function unwrapUploadedUserImage(response: unknown): UserImage | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data) return null;
  const record = asRecord(data);
  if (record?.images) return unwrapUserImage(data);
  if (record?.item) return unwrapUserImage(record.item);
  return unwrapUserImage(data);
}

export const IMAGE_UPLOAD_MAX_BYTES = 7 * 1024 * 1024;
export const IMAGE_UPLOAD_MAX_DIMENSION = 2000;
export const IMAGE_UPLOAD_QUALITY = 0.85;

/** Letters, numbers, underscore, hyphen only — no spaces or special chars. */
export function normalizeImageType(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '');
}

export function isValidImageType(value: string) {
  return /^[a-z0-9][a-z0-9_-]{0,31}$/.test(value);
}
