'use client';

import { useCallback, useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { prepareImageForUpload } from '@/lib/images/prepareImageForUpload';
import { getDeletableImageUrl } from '@/lib/images/getDeletableImageUrl';
import {
  isValidImageType,
  normalizeImageType,
} from '@/lib/images/imageResponse';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import type { UserImage } from '@/lib/images/types';
import {
  useDeleteUserImageByPathMutation,
  useGetUserImagesQuery,
  useUploadUserImageMutation,
} from '@/lib/services/imagesApi';
import { useExclusiveAction } from '@/hooks/useExclusiveAction';

export function useProfileImages(params?: {
  page?: number;
  limit?: number;
  type?: string;
}) {
  const { showToast } = useToast();
  const query = useGetUserImagesQuery({
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    type: params?.type,
  });
  const [uploadImage, uploadState] = useUploadUserImageMutation();
  const [deleteImageByPath, deleteState] = useDeleteUserImageByPathMutation();
  const inFlightRef = useRef(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const { runExclusive } = useExclusiveAction({ cooldownMs: 500 });

  const upload = useCallback(
    async (file: File, typeInput: string, idempotencyKey?: string) => {
      if (inFlightRef.current) return null;
      inFlightRef.current = true;
      setIsPreparing(true);

      const requestKey = idempotencyKey || crypto.randomUUID();

      try {
        const type = normalizeImageType(typeInput);
        if (!isValidImageType(type)) {
          showToast(
            'Type must be lowercase letters, numbers, _ or - (e.g. profile).',
            'error',
          );
          return null;
        }

        const prepared = await prepareImageForUpload(file);
        const result = await uploadImage({
          file: prepared.file,
          type,
          idempotencyKey: requestKey,
        }).unwrap();

        if (!result) {
          showToast('Upload succeeded but no image was returned.', 'error');
          return null;
        }

        showToast(
          `Uploaded (${(prepared.preparedBytes / 1024).toFixed(0)} KB after compress).`,
        );
        await query.refetch();
        return result;
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : getApiErrorMessage(error, 'Failed to upload image.'),
          'error',
        );
        return null;
      } finally {
        inFlightRef.current = false;
        setIsPreparing(false);
      }
    },
    [query, showToast, uploadImage],
  );

  const remove = useCallback(
    async (image: UserImage) => {
      const url = getDeletableImageUrl(image);
      if (!url) {
        showToast('No image URL available to delete.', 'error');
        return false;
      }

      const result = await runExclusive(async () => {
        try {
          await deleteImageByPath({ url }).unwrap();
          showToast('Image deleted.');
          await query.refetch();
          return true;
        } catch (error) {
          showToast(
            getApiErrorMessage(error, 'Failed to delete image.'),
            'error',
          );
          return false;
        }
      });

      return result ?? false;
    },
    [deleteImageByPath, query, runExclusive, showToast],
  );

  return {
    images: query.data?.items ?? [],
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isUploading: isPreparing || uploadState.isLoading,
    isDeleting: deleteState.isLoading,
    upload,
    remove,
    refetch: query.refetch,
  };
}
