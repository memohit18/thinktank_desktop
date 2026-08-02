import {
  FileText,
  LayoutDashboard,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';

export type CareerModuleNavId =
  | 'dashboard'
  | 'profile'
  | 'preferences'
  | 'resume';

export const CAREER_MODULE_NAV_ITEMS = [
  {
    id: 'dashboard' as const,
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/career/dashboard',
    disabled: false,
  },
  {
    id: 'profile' as const,
    label: 'Profile',
    icon: UserRound,
    href: '/career/profile',
    disabled: false,
  },
  {
    id: 'preferences' as const,
    label: 'Preferences',
    icon: SlidersHorizontal,
    href: '/career/preferences',
    disabled: false,
  },
  {
    id: 'resume' as const,
    label: 'Resume',
    icon: FileText,
    href: '/career/resume',
    disabled: false,
  },
] as const;
