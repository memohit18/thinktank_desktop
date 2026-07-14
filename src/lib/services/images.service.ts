import type { UserImagesParams } from '@/lib/images/types';

function withQuery(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export type UploadImagePayload = {
  file: File;
  type: string;
  /** Stable UUID for this user action — backend uses it for request dedupe. */
  idempotencyKey?: string;
};

export type DeleteImageByPathPayload = {
  /** Any size URL for the image (e.g. medium.webp). */
  url: string;
};

export const imagesService = {
  list(params?: UserImagesParams) {
    return withQuery('/images', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      type: params?.type,
    });
  },
  upload(payload: UploadImagePayload) {
    const body = new FormData();
    body.append('type', payload.type);
    body.append('file', payload.file);

    const idempotencyKey =
      payload.idempotencyKey?.trim() ||
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    return {
      url: '/images',
      method: 'POST' as const,
      body,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    };
  },
  deleteByPath(payload: DeleteImageByPathPayload) {
    return {
      url: '/images/by-path',
      method: 'DELETE' as const,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        url: payload.url,
      },
    };
  },
};
