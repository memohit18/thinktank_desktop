'use client';

import { useToast } from '@/components/ui/Toast';
import {
  CAREER_RESUME_ACCEPT,
  CAREER_RESUME_MAX_BYTES,
} from '@/lib/career/constants';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useDeleteCareerResumeMutation,
  useGetCareerResumesQuery,
  useSetDefaultCareerResumeMutation,
  useUploadCareerResumeMutation,
} from '@/lib/services/careerApi';
import { RTK_QUERY_FRESH_CACHE } from '@/lib/services/rtkQueryDefaults';

export function useCareerResumes() {
  const { showToast } = useToast();
  const resumesQuery = useGetCareerResumesQuery(
    undefined,
    RTK_QUERY_FRESH_CACHE,
  );
  const [uploadResume, uploadState] = useUploadCareerResumeMutation();
  const [setDefault, setDefaultState] = useSetDefaultCareerResumeMutation();
  const [deleteResume, deleteState] = useDeleteCareerResumeMutation();

  async function upload(file: File, title?: string) {
    if (file.size > CAREER_RESUME_MAX_BYTES) {
      showToast('Resume must be 10MB or smaller', 'error');
      return false;
    }

    const lower = file.name.toLowerCase();
    const allowed =
      lower.endsWith('.pdf') ||
      lower.endsWith('.txt') ||
      file.type === 'application/pdf' ||
      file.type === 'text/plain';

    if (!allowed) {
      showToast('Only PDF or .txt resumes are accepted', 'error');
      return false;
    }

    try {
      await uploadResume({ file, title }).unwrap();
      showToast('Resume uploaded', 'success');
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Could not upload resume'),
        'error',
      );
      return false;
    }
  }

  async function makeDefault(resumeId: string) {
    try {
      await setDefault(resumeId).unwrap();
      showToast('Default resume updated', 'success');
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Could not set default resume'),
        'error',
      );
    }
  }

  async function remove(resumeId: string) {
    try {
      await deleteResume(resumeId).unwrap();
      showToast('Resume deleted', 'success');
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Could not delete resume'),
        'error',
      );
    }
  }

  return {
    resumes: resumesQuery.data ?? [],
    accept: CAREER_RESUME_ACCEPT,
    isLoading: resumesQuery.isLoading,
    isError: resumesQuery.isError,
    isMutating:
      uploadState.isLoading ||
      setDefaultState.isLoading ||
      deleteState.isLoading,
    isUploading: uploadState.isLoading,
    refetch: resumesQuery.refetch,
    upload,
    makeDefault,
    remove,
  };
}
