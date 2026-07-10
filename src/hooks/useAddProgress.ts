'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useAddProgressEntryMutation,
  useDeleteProgressPhotosMutation,
  useGetPresignedUploadUrlMutation,
  useSaveProgressPhotosMutation,
} from '@/lib/services/progressApi';
import type {
  AddProgressPayload,
  ProgressPhotoAngle,
  SaveProgressPhotosPayload,
} from '@/lib/fitness/progress/types';

export function useAddProgress() {
  const { showToast } = useToast();
  const [addProgress, addState] = useAddProgressEntryMutation();
  const [getPresignedUrl, uploadState] = useGetPresignedUploadUrlMutation();
  const [savePhotos, savePhotosState] = useSaveProgressPhotosMutation();
  const [deletePhotos, deletePhotosState] = useDeleteProgressPhotosMutation();

  const save = useCallback(
    async (payload: AddProgressPayload) => {
      try {
        const entry = await addProgress(payload).unwrap();
        showToast('Progress logged successfully.');
        return entry;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to save progress entry.'),
          'error',
        );
        return null;
      }
    },
    [addProgress, showToast],
  );

  const uploadAngle = useCallback(
    async (file: File, photoType: ProgressPhotoAngle) => {
      const presigned = await getPresignedUrl({
        fileName: file.name,
        contentType: file.type || 'image/jpeg',
        size: file.size,
        category: 'progress',
        photoType,
      }).unwrap();

      if (!presigned?.uploadUrl) {
        throw new Error('Upload URL was not returned by the server.');
      }

      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo to storage.');
      }

      return presigned.publicUrl || null;
    },
    [getPresignedUrl],
  );

  const uploadPhotoSet = useCallback(
    async (files: {
      front?: File | null;
      side?: File | null;
      back?: File | null;
    }) => {
      try {
        const payload: SaveProgressPhotosPayload = {};

        if (files.front) {
          const url = await uploadAngle(files.front, 'front');
          if (url) payload.frontImageUrl = url;
        }
        if (files.side) {
          const url = await uploadAngle(files.side, 'side');
          if (url) payload.sideImageUrl = url;
        }
        if (files.back) {
          const url = await uploadAngle(files.back, 'back');
          if (url) payload.backImageUrl = url;
        }

        if (
          !payload.frontImageUrl &&
          !payload.sideImageUrl &&
          !payload.backImageUrl
        ) {
          throw new Error('Upload at least one front, side, or back photo.');
        }

        const saved = await savePhotos(payload).unwrap();
        showToast('Progress photos saved.');
        return saved;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to upload progress photos.'),
          'error',
        );
        return null;
      }
    },
    [savePhotos, showToast, uploadAngle],
  );

  const removePhotoSet = useCallback(
    async (id: string) => {
      try {
        await deletePhotos(id).unwrap();
        showToast('Progress photos deleted.');
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to delete progress photos.'),
          'error',
        );
        return false;
      }
    },
    [deletePhotos, showToast],
  );

  return {
    save,
    uploadPhotoSet,
    removePhotoSet,
    isSaving: addState.isLoading,
    isUploading: uploadState.isLoading || savePhotosState.isLoading,
    isDeletingPhotos: deletePhotosState.isLoading,
  };
}
