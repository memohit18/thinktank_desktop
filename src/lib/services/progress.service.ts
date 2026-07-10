import type {
  AddProgressPayload,
  PresignedUploadPayload,
  SaveProgressPhotosPayload,
} from '@/lib/fitness/progress/types';
import { buildAddProgressBody } from '@/lib/fitness/progress/progressResponse';

export type ProgressHistoryParams = {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
};

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

export const progressService = {
  history(params?: ProgressHistoryParams) {
    return withQuery('/progress/history', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      from: params?.from,
      to: params?.to,
    });
  },
  latest() {
    return '/progress/latest';
  },
  analytics(params?: { from?: string; to?: string }) {
    return withQuery('/progress/analytics', {
      from: params?.from,
      to: params?.to,
    });
  },
  dashboard() {
    return '/progress/dashboard';
  },
  create(body: AddProgressPayload) {
    return {
      url: '/progress',
      method: 'POST' as const,
      body: buildAddProgressBody(body),
    };
  },
  update(id: string, body: AddProgressPayload) {
    return {
      url: `/progress/${id}`,
      method: 'PUT' as const,
      body: buildAddProgressBody(body),
    };
  },
  photos(params?: { page?: number; limit?: number }) {
    return withQuery('/progress/photos', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
  },
  savePhotos(body: SaveProgressPhotosPayload) {
    return {
      url: '/progress/photos',
      method: 'POST' as const,
      body,
    };
  },
  deletePhotos(id: string) {
    return {
      url: `/progress/photos/${id}`,
      method: 'DELETE' as const,
    };
  },
  uploadPresigned(body: PresignedUploadPayload) {
    return {
      url: '/uploads/presigned-url',
      method: 'POST' as const,
      body: {
        fileName: body.fileName,
        contentType: body.contentType,
        size: body.size,
        category: body.category ?? 'progress',
        photoType: body.photoType,
      },
    };
  },
};
