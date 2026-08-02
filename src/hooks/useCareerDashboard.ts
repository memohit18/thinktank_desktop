'use client';

import { formatSalaryRangeLpa } from '@/lib/career/careerResponse';
import type { CareerDashboard } from '@/lib/career/types';
import {
  useGetCareerOverviewQuery,
  useGetCareerPreferencesQuery,
  useGetCareerProfileQuery,
  useGetCareerResumesQuery,
} from '@/lib/services/careerApi';
import { RTK_QUERY_FRESH_CACHE } from '@/lib/services/rtkQueryDefaults';

export function useCareerDashboard() {
  const overviewQuery = useGetCareerOverviewQuery(
    undefined,
    RTK_QUERY_FRESH_CACHE,
  );
  const profileQuery = useGetCareerProfileQuery(
    undefined,
    RTK_QUERY_FRESH_CACHE,
  );
  const preferencesQuery = useGetCareerPreferencesQuery(
    undefined,
    RTK_QUERY_FRESH_CACHE,
  );
  const resumesQuery = useGetCareerResumesQuery(
    undefined,
    RTK_QUERY_FRESH_CACHE,
  );

  const composed: CareerDashboard | null = (() => {
    const overview = overviewQuery.data;
    const profile = overview?.profile ?? profileQuery.data ?? null;
    const preferences =
      overview?.preferences ?? preferencesQuery.data ?? null;
    const resumes = overview?.resumes?.length
      ? overview.resumes
      : (resumesQuery.data ?? []);
    const defaultResume = resumes.find((resume) => resume.isDefault);

    if (!profile && !preferences && resumes.length === 0) return null;

    return {
      status: profile?.isActive === false ? 'INACTIVE' : 'ACTIVE',
      defaultResumeTitle: defaultResume?.title ?? null,
      preferredRoles: preferences?.preferredRoles ?? [],
      preferredSalaryLabel: formatSalaryRangeLpa(
        preferences?.minSalary ?? profile?.expectedMinCtc,
        preferences?.maxSalary ?? profile?.expectedMaxCtc,
      ),
      autoApply: preferences?.autoApply ?? false,
    };
  })();

  const isLoading =
    (overviewQuery.isLoading ||
      profileQuery.isLoading ||
      preferencesQuery.isLoading ||
      resumesQuery.isLoading) &&
    !composed;

  const isError =
    overviewQuery.isError &&
    profileQuery.isError &&
    preferencesQuery.isError &&
    !composed;

  return {
    dashboard: composed,
    roleLabels: composed?.preferredRoles ?? [],
    isLoading,
    isError,
    isFetching:
      overviewQuery.isFetching ||
      profileQuery.isFetching ||
      preferencesQuery.isFetching ||
      resumesQuery.isFetching,
    refetch: () => {
      void overviewQuery.refetch();
      void profileQuery.refetch();
      void preferencesQuery.refetch();
      void resumesQuery.refetch();
    },
  };
}
