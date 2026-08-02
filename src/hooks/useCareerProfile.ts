'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/Toast';
import {
  getInitialCareerProfileFormValues,
  toCareerProfilePayload,
} from '@/lib/career/profileMapper';
import { careerProfileSchema } from '@/lib/career/schemas/career.schema';
import type { CareerProfileFormValues } from '@/lib/career/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCreateCareerProfileMutation,
  useGetCareerProfileQuery,
  useUpdateCareerProfileMutation,
} from '@/lib/services/careerApi';
import { RTK_QUERY_FRESH_CACHE } from '@/lib/services/rtkQueryDefaults';

export function useCareerProfile() {
  const { showToast } = useToast();
  const profileQuery = useGetCareerProfileQuery(
    undefined,
    RTK_QUERY_FRESH_CACHE,
  );
  const [createProfile, createState] = useCreateCareerProfileMutation();
  const [updateProfile, updateState] = useUpdateCareerProfileMutation();

  const form = useForm<CareerProfileFormValues>({
    resolver: zodResolver(
      careerProfileSchema,
    ) as Resolver<CareerProfileFormValues>,
    defaultValues: getInitialCareerProfileFormValues(profileQuery.data),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    form.reset(getInitialCareerProfileFormValues(profileQuery.data));
  }, [form, profileQuery.data]);

  async function saveProfile(values: CareerProfileFormValues) {
    const payload = toCareerProfilePayload(values);

    try {
      if (profileQuery.data) {
        await updateProfile(payload).unwrap();
        showToast('Career profile updated', 'success');
      } else {
        await createProfile(payload).unwrap();
        showToast('Career profile created', 'success');
      }
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Could not save career profile'),
        'error',
      );
      return false;
    }
  }

  return {
    profile: profileQuery.data ?? null,
    form,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    isSaving: createState.isLoading || updateState.isLoading,
    refetch: profileQuery.refetch,
    saveProfileValues: saveProfile,
    submitProfile: () =>
      new Promise<boolean>((resolve) => {
        void form.handleSubmit(
          async (values) => {
            resolve(await saveProfile(values));
          },
          () => {
            resolve(false);
          },
        )();
      }),
  };
}
