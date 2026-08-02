'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { EMPTY_CAREER_PREFERENCES } from '@/lib/career/constants';
import { toCareerPreferencesPayload } from '@/lib/career/profileMapper';
import type {
  CareerPreferences,
  EmploymentType,
  WorkMode,
} from '@/lib/career/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCreateCareerPreferencesMutation,
  useGetCareerPreferencesQuery,
  useUpdateCareerPreferencesMutation,
} from '@/lib/services/careerApi';
import { RTK_QUERY_FRESH_CACHE } from '@/lib/services/rtkQueryDefaults';

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function useCareerPreferences() {
  const { showToast } = useToast();
  const preferencesQuery = useGetCareerPreferencesQuery(
    undefined,
    RTK_QUERY_FRESH_CACHE,
  );
  const [createPreferences, createState] =
    useCreateCareerPreferencesMutation();
  const [updatePreferences, updateState] =
    useUpdateCareerPreferencesMutation();
  const [draft, setDraft] = useState<CareerPreferences>({
    ...EMPTY_CAREER_PREFERENCES,
  });

  const exists = Boolean(preferencesQuery.data);

  useEffect(() => {
    if (!preferencesQuery.data) {
      setDraft({ ...EMPTY_CAREER_PREFERENCES });
      return;
    }
    setDraft(preferencesQuery.data);
  }, [preferencesQuery.data]);

  async function save(next: CareerPreferences = draft) {
    const payload = toCareerPreferencesPayload(next);

    try {
      const saved = exists
        ? await updatePreferences(payload).unwrap()
        : await createPreferences(payload).unwrap();
      setDraft(saved);
      showToast('Preferences saved', 'success');
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Could not save preferences'),
        'error',
      );
      return false;
    }
  }

  return {
    preferences: draft,
    exists,
    isLoading: preferencesQuery.isLoading,
    isError: preferencesQuery.isError,
    isSaving: createState.isLoading || updateState.isLoading,
    refetch: preferencesQuery.refetch,
    save,
    toggleRole: (role: string) =>
      setDraft((prev) => ({
        ...prev,
        preferredRoles: toggleValue(prev.preferredRoles, role),
      })),
    toggleLocation: (location: string) =>
      setDraft((prev) => ({
        ...prev,
        preferredLocations: toggleValue(prev.preferredLocations, location),
      })),
    toggleEmployment: (employment: EmploymentType) =>
      setDraft((prev) => ({
        ...prev,
        employmentTypes: toggleValue(prev.employmentTypes, employment),
      })),
    toggleWorkMode: (mode: WorkMode) =>
      setDraft((prev) => ({
        ...prev,
        workModes: toggleValue(prev.workModes, mode),
      })),
    setSalary: (minSalary: number | null, maxSalary: number | null) =>
      setDraft((prev) => ({ ...prev, minSalary, maxSalary })),
    setCompanies: (
      preferredCompanies: string[],
      blockedCompanies: string[],
    ) => setDraft((prev) => ({ ...prev, preferredCompanies, blockedCompanies })),
    setAutoApply: (autoApply: boolean) =>
      setDraft((prev) => ({ ...prev, autoApply })),
  };
}
