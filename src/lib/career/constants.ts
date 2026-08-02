import type { EmploymentType, WorkMode } from '@/lib/career/types';

/** Display labels sent as preferredRoles strings to the API. */
export const PREFERRED_ROLE_OPTIONS = [
  'Backend',
  'Frontend',
  'Full Stack',
  'AI Engineer',
] as const;

export const LOCATION_OPTIONS = ['Delhi', 'Remote', 'Bangalore'] as const;

export const EMPLOYMENT_OPTIONS: {
  value: EmploymentType;
  label: string;
}[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

export const WORK_MODE_OPTIONS: {
  value: WorkMode;
  label: string;
}[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

export const EMPTY_CAREER_PREFERENCES = {
  preferredRoles: [] as string[],
  preferredLocations: [] as string[],
  employmentTypes: [] as EmploymentType[],
  workModes: [] as WorkMode[],
  preferredSkills: [] as string[],
  preferredCompanies: [] as string[],
  blockedCompanies: [] as string[],
  minSalary: null as number | null,
  maxSalary: null as number | null,
  searchKeywords: [] as string[],
  autoApply: false,
  isActive: true,
};

export const EMPTY_CAREER_PROFILE_FORM = {
  currentCompany: '',
  currentRole: '',
  totalExperience: '' as number | '',
  currentCtc: '' as number | '',
  expectedMinCtc: '' as number | '',
  expectedMaxCtc: '' as number | '',
  noticePeriod: '' as number | '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  summary: '',
  isActive: true,
};

export const CAREER_RESUME_ACCEPT = '.pdf,.txt,application/pdf,text/plain';
export const CAREER_RESUME_MAX_BYTES = 10 * 1024 * 1024;
