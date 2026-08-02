import type { UploadCareerResumePayload } from '@/lib/career/types';

export const careerService = {
  overview() {
    return '/career';
  },
  profile() {
    return '/career/profile';
  },
  preferences() {
    return '/career/preferences';
  },
  resumes() {
    return '/career/resumes';
  },
  resumeDefault(resumeId: string) {
    return `/career/resumes/${resumeId}/default`;
  },
  resumeById(resumeId: string) {
    return `/career/resumes/${resumeId}`;
  },
  uploadResume(payload: UploadCareerResumePayload) {
    const body = new FormData();
    body.append('file', payload.file);
    if (payload.title?.trim()) {
      body.append('title', payload.title.trim());
    }

    return {
      url: '/career/resumes/upload',
      method: 'POST' as const,
      body,
    };
  },
};
