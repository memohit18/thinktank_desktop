import { EMPTY_CAREER_PROFILE_FORM } from '@/lib/career/constants';
import type {
  CareerPreferences,
  CareerPreferencesPayload,
  CareerProfile,
  CareerProfileFormValues,
  CareerProfilePayload,
} from '@/lib/career/types';

const REQUIRED_PROFILE_FIELDS: (keyof CareerProfile)[] = [
  'currentCompany',
  'currentRole',
  'totalExperience',
  'currentCtc',
  'noticePeriod',
];

export function hasCompletedCareerOnboarding(
  profile: CareerProfile | null | undefined,
) {
  if (!profile) return false;

  return REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = profile[field];
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return Number.isFinite(value);
    return Boolean(value);
  });
}

export function mapCareerProfileToFormValues(
  profile: CareerProfile,
): CareerProfileFormValues {
  return {
    currentCompany: profile.currentCompany,
    currentRole: profile.currentRole,
    totalExperience: profile.totalExperience,
    currentCtc: profile.currentCtc,
    expectedMinCtc: profile.expectedMinCtc,
    expectedMaxCtc: profile.expectedMaxCtc,
    noticePeriod: profile.noticePeriod,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    portfolioUrl: profile.portfolioUrl,
    summary: profile.summary,
    isActive: profile.isActive,
  };
}

export function getInitialCareerProfileFormValues(
  profile: CareerProfile | null | undefined,
): CareerProfileFormValues {
  if (!profile) return { ...EMPTY_CAREER_PROFILE_FORM };
  return mapCareerProfileToFormValues(profile);
}

export function toCareerProfilePayload(
  values: CareerProfileFormValues,
): CareerProfilePayload {
  return {
    currentCompany: values.currentCompany.trim(),
    currentRole: values.currentRole.trim(),
    totalExperience: Number(values.totalExperience) || 0,
    currentCtc: Number(values.currentCtc) || 0,
    expectedMinCtc: Number(values.expectedMinCtc) || 0,
    expectedMaxCtc: Number(values.expectedMaxCtc) || 0,
    noticePeriod: Number(values.noticePeriod) || 0,
    linkedinUrl: values.linkedinUrl.trim(),
    githubUrl: values.githubUrl.trim(),
    portfolioUrl: values.portfolioUrl.trim(),
    summary: values.summary.trim(),
    isActive: values.isActive,
  };
}

export function toCareerPreferencesPayload(
  preferences: CareerPreferences,
): CareerPreferencesPayload {
  return {
    preferredRoles: preferences.preferredRoles,
    preferredLocations: preferences.preferredLocations,
    employmentTypes: preferences.employmentTypes,
    workModes: preferences.workModes,
    preferredSkills: preferences.preferredSkills,
    preferredCompanies: preferences.preferredCompanies,
    blockedCompanies: preferences.blockedCompanies,
    minSalary: preferences.minSalary,
    maxSalary: preferences.maxSalary,
    searchKeywords: preferences.searchKeywords,
    autoApply: preferences.autoApply,
    isActive: preferences.isActive,
  };
}

export function buildCareerProfileSections(profile: CareerProfile) {
  return [
    {
      id: 'basic',
      title: 'Basic Information',
      items: [
        { label: 'Current Company', value: profile.currentCompany || '—' },
        { label: 'Current Role', value: profile.currentRole || '—' },
        {
          label: 'Experience',
          value:
            profile.totalExperience != null
              ? `${profile.totalExperience} years`
              : '—',
        },
        {
          label: 'Salary',
          value:
            profile.currentCtc != null ? `${profile.currentCtc} LPA` : '—',
        },
        {
          label: 'Notice Period',
          value:
            profile.noticePeriod != null
              ? `${profile.noticePeriod} days`
              : '—',
        },
      ],
    },
    {
      id: 'links',
      title: 'Links',
      items: [
        { label: 'Github', value: profile.githubUrl || '—' },
        { label: 'LinkedIn', value: profile.linkedinUrl || '—' },
        { label: 'Portfolio', value: profile.portfolioUrl || '—' },
      ],
    },
    {
      id: 'summary',
      title: 'Professional Summary',
      items: [
        {
          label: 'Summary',
          value: profile.summary || '—',
        },
      ],
    },
  ];
}
