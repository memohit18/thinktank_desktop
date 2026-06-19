import type { PortalSettings, UserProfileDetail } from '@/lib/settings/types';

export const DEFAULT_USER_PROFILE: UserProfileDetail = {
  name: 'Mohit Kumar',
  email: 'mohit@securecore.tech',
  phone: '',
  role: 'admin',
  avatar: null,
};

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  sidebarNav: [
    {
      id: 'nav-dashboard',
      moduleId: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      description: 'Overview and quick links for your workspace.',
      visible: true,
    },
    {
      id: 'nav-coding-challenges',
      moduleId: 'coding-challenges',
      label: 'Coding Challenges',
      href: '/code',
      description: 'DSA practice track with editor and submissions.',
      visible: true,
    },
  ],
  modules: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Landing page with stats and shortcuts.',
      enabled: true,
      viewMode: 'desktop',
    },
    {
      id: 'coding-challenges',
      name: 'Coding Challenges',
      description: 'Problem list, editor, roadmaps, and progress.',
      enabled: true,
      viewMode: 'desktop',
    },
  ],
};
