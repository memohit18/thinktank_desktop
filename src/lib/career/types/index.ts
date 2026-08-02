export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'internship'
  | 'freelance';

export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export type CreateCareerProfileDto = {
  currentCompany: string;
  currentRole: string;
  totalExperience: number;
  currentCtc: number;
  expectedMinCtc: number;
  expectedMaxCtc: number;
  noticePeriod: number;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  isActive?: boolean;
};

export type CareerProfile = CreateCareerProfileDto & {
  id: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CareerProfilePayload = CreateCareerProfileDto;

export type CareerPreferences = {
  id?: string;
  preferredRoles: string[];
  preferredLocations: string[];
  employmentTypes: EmploymentType[];
  workModes: WorkMode[];
  preferredSkills: string[];
  preferredCompanies: string[];
  blockedCompanies: string[];
  minSalary: number | null;
  maxSalary: number | null;
  searchKeywords: string[];
  autoApply: boolean;
  isActive: boolean;
};

export type CareerPreferencesPayload = {
  preferredRoles: string[];
  preferredLocations: string[];
  employmentTypes: EmploymentType[];
  workModes: WorkMode[];
  preferredSkills: string[];
  preferredCompanies: string[];
  blockedCompanies: string[];
  minSalary: number | null;
  maxSalary: number | null;
  searchKeywords: string[];
  autoApply: boolean;
  isActive: boolean;
};

export type UpdateCareerPreferencesPayload = Partial<CareerPreferencesPayload>;

export type CareerResumeParsed = {
  skills: unknown[];
  experience: unknown[];
  education: unknown[];
};

export type CareerResume = {
  id: string;
  title: string;
  version: number;
  isDefault: boolean;
  fileUrl: string | null;
  rating: number;
  uploadedAt: string;
  parsed?: CareerResumeParsed | null;
};

export type UploadCareerResumePayload = {
  file: File;
  title?: string;
};

export type CareerOverview = {
  profile: CareerProfile | null;
  preferences: CareerPreferences | null;
  resumes: CareerResume[];
};

export type CareerDashboard = {
  status: 'ACTIVE' | 'INACTIVE';
  defaultResumeTitle: string | null;
  preferredRoles: string[];
  preferredSalaryLabel: string | null;
  autoApply: boolean;
};

export type CareerProfileFormValues = {
  currentCompany: string;
  currentRole: string;
  totalExperience: number | '';
  currentCtc: number | '';
  expectedMinCtc: number | '';
  expectedMaxCtc: number | '';
  noticePeriod: number | '';
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  isActive: boolean;
};
