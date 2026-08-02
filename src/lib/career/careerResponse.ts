import { EMPTY_CAREER_PREFERENCES } from '@/lib/career/constants';
import type {
  CareerDashboard,
  CareerOverview,
  CareerPreferences,
  CareerProfile,
  CareerResume,
  CareerResumeParsed,
  EmploymentType,
  WorkMode,
} from '@/lib/career/types';

export type CareerApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CareerApiErrorEnvelope = {
  statusCode: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
};

export function isCareerErrorEnvelope(
  response: unknown,
): response is CareerApiErrorEnvelope {
  return (
    !!response &&
    typeof response === 'object' &&
    'statusCode' in response &&
    typeof (response as CareerApiErrorEnvelope).statusCode === 'number'
  );
}

export function isMissingCareerResourceStatus(status: unknown) {
  return status === 404;
}

export function unwrapCareerData<T>(response: unknown): T | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (isCareerErrorEnvelope(response)) {
    return null;
  }

  if ('success' in response) {
    const envelope = response as CareerApiEnvelope<T>;
    if (!envelope.success) return null;
    if ('data' in envelope) return envelope.data ?? null;
    return null;
  }

  return response as T;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function asBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function normalizeEmploymentTypes(value: unknown): EmploymentType[] {
  const allowed = new Set<EmploymentType>([
    'full_time',
    'part_time',
    'contract',
    'internship',
    'freelance',
  ]);
  return asStringArray(value).filter((item): item is EmploymentType =>
    allowed.has(item as EmploymentType),
  );
}

function normalizeWorkModes(value: unknown): WorkMode[] {
  const allowed = new Set<WorkMode>(['remote', 'hybrid', 'onsite']);
  return asStringArray(value).filter((item): item is WorkMode =>
    allowed.has(item as WorkMode),
  );
}

function normalizeProfileRecord(
  record: Record<string, unknown>,
): CareerProfile | null {
  const id = asString(record.id ?? record._id ?? record.profileId);
  if (!id && !('currentCompany' in record || 'currentRole' in record)) {
    return null;
  }

  return {
    id: id || 'profile',
    currentCompany: asString(record.currentCompany),
    currentRole: asString(record.currentRole),
    totalExperience: asNumber(record.totalExperience) ?? 0,
    currentCtc: asNumber(record.currentCtc) ?? 0,
    expectedMinCtc: asNumber(record.expectedMinCtc) ?? 0,
    expectedMaxCtc: asNumber(record.expectedMaxCtc) ?? 0,
    noticePeriod: asNumber(record.noticePeriod) ?? 0,
    linkedinUrl: asString(record.linkedinUrl),
    githubUrl: asString(record.githubUrl),
    portfolioUrl: asString(record.portfolioUrl),
    summary: asString(record.summary),
    isActive: asBoolean(record.isActive, true),
    createdAt: asString(record.createdAt) || undefined,
    updatedAt: asString(record.updatedAt) || undefined,
  };
}

export function unwrapCareerProfile(response: unknown): CareerProfile | null {
  const data = unwrapCareerData<CareerProfile | { profile: CareerProfile }>(
    response,
  );
  if (!data) return null;

  const raw =
    typeof data === 'object' && 'profile' in data && data.profile
      ? data.profile
      : data;

  if (!raw || typeof raw !== 'object') return null;
  return normalizeProfileRecord(raw as Record<string, unknown>);
}

function normalizePreferencesRecord(
  record: Record<string, unknown>,
): CareerPreferences {
  return {
    id: asString(record.id) || undefined,
    preferredRoles: asStringArray(record.preferredRoles),
    preferredLocations: asStringArray(
      record.preferredLocations ?? record.locations,
    ),
    employmentTypes: normalizeEmploymentTypes(record.employmentTypes),
    workModes: normalizeWorkModes(record.workModes),
    preferredSkills: asStringArray(record.preferredSkills),
    preferredCompanies: asStringArray(record.preferredCompanies),
    blockedCompanies: asStringArray(record.blockedCompanies),
    minSalary: asNumber(record.minSalary ?? record.expectedMinCtc),
    maxSalary: asNumber(record.maxSalary ?? record.expectedMaxCtc),
    searchKeywords: asStringArray(record.searchKeywords),
    autoApply: asBoolean(record.autoApply, false),
    isActive: asBoolean(record.isActive, true),
  };
}

export function unwrapCareerPreferences(
  response: unknown,
): CareerPreferences | null {
  const data = unwrapCareerData<
    CareerPreferences | { preferences: CareerPreferences }
  >(response);

  if (!data) return null;

  const raw =
    typeof data === 'object' && 'preferences' in data && data.preferences
      ? data.preferences
      : data;

  if (!raw || typeof raw !== 'object') return { ...EMPTY_CAREER_PREFERENCES };

  return normalizePreferencesRecord(raw as Record<string, unknown>);
}

function normalizeParsed(value: unknown): CareerResumeParsed | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  return {
    skills: Array.isArray(record.skills) ? record.skills : [],
    experience: Array.isArray(record.experience) ? record.experience : [],
    education: Array.isArray(record.education) ? record.education : [],
  };
}

function normalizeResume(item: unknown): CareerResume | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;
  const id = asString(record.resumeId ?? record.id);
  if (!id) return null;

  return {
    id,
    title: asString(record.title, 'Untitled Resume'),
    version: asNumber(record.version) ?? 1,
    isDefault: asBoolean(record.isDefault, false),
    fileUrl:
      typeof record.fileUrl === 'string' && record.fileUrl
        ? record.fileUrl
        : null,
    rating: Math.min(5, Math.max(0, asNumber(record.rating) ?? 0)),
    uploadedAt:
      asString(record.uploadedAt) ||
      asString(record.createdAt) ||
      new Date().toISOString(),
    parsed: normalizeParsed(record.parsed),
  };
}

export function unwrapCareerResume(response: unknown): CareerResume | null {
  const data = unwrapCareerData<CareerResume | { resume: CareerResume }>(
    response,
  );
  if (!data) return null;

  if (typeof data === 'object' && 'resume' in data && data.resume) {
    return normalizeResume(data.resume);
  }

  return normalizeResume(data);
}

export function unwrapCareerResumes(response: unknown): CareerResume[] {
  const data = unwrapCareerData<
    CareerResume[] | { resumes: CareerResume[]; items?: CareerResume[] }
  >(response);

  if (!data) return [];

  if (Array.isArray(data)) {
    return data
      .map(normalizeResume)
      .filter((item): item is CareerResume => item !== null);
  }

  if (typeof data === 'object' && Array.isArray(data.resumes)) {
    return data.resumes
      .map(normalizeResume)
      .filter((item): item is CareerResume => item !== null);
  }

  if (typeof data === 'object' && Array.isArray(data.items)) {
    return data.items
      .map(normalizeResume)
      .filter((item): item is CareerResume => item !== null);
  }

  const single = normalizeResume(data);
  return single ? [single] : [];
}

export function unwrapCareerOverview(response: unknown): CareerOverview | null {
  const data = unwrapCareerData<Record<string, unknown>>(response);
  if (!data || typeof data !== 'object') return null;

  const profile =
    data.profile && typeof data.profile === 'object'
      ? normalizeProfileRecord(data.profile as Record<string, unknown>)
      : unwrapCareerProfile({ success: true, message: '', data });

  const preferences =
    data.preferences && typeof data.preferences === 'object'
      ? normalizePreferencesRecord(
          data.preferences as Record<string, unknown>,
        )
      : null;

  const resumes = Array.isArray(data.resumes)
    ? data.resumes
        .map(normalizeResume)
        .filter((item): item is CareerResume => item !== null)
    : [];

  return {
    profile,
    preferences,
    resumes,
  };
}

export function unwrapCareerDashboard(
  response: unknown,
): CareerDashboard | null {
  const overview = unwrapCareerOverview(response);
  if (overview) {
    const defaultResume = overview.resumes.find((resume) => resume.isDefault);
    return {
      status: overview.profile?.isActive === false ? 'INACTIVE' : 'ACTIVE',
      defaultResumeTitle: defaultResume?.title ?? null,
      preferredRoles: overview.preferences?.preferredRoles ?? [],
      preferredSalaryLabel: formatSalaryRangeLpa(
        overview.preferences?.minSalary ?? overview.profile?.expectedMinCtc,
        overview.preferences?.maxSalary ?? overview.profile?.expectedMaxCtc,
      ),
      autoApply: overview.preferences?.autoApply ?? false,
    };
  }

  const data = unwrapCareerData<CareerDashboard>(response);
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  return {
    status: record.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    defaultResumeTitle:
      typeof record.defaultResumeTitle === 'string'
        ? record.defaultResumeTitle
        : null,
    preferredRoles: asStringArray(record.preferredRoles),
    preferredSalaryLabel:
      typeof record.preferredSalaryLabel === 'string'
        ? record.preferredSalaryLabel
        : null,
    autoApply: asBoolean(record.autoApply, false),
  };
}

export function formatSalaryRangeLpa(
  minCtc: number | null | undefined,
  maxCtc: number | null | undefined,
) {
  if (minCtc == null && maxCtc == null) return null;
  if (minCtc != null && maxCtc != null) return `${minCtc}-${maxCtc} LPA`;
  if (minCtc != null) return `${minCtc}+ LPA`;
  return `Up to ${maxCtc} LPA`;
}
