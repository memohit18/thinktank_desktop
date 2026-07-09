import type { SidebarNavItemConfig } from '@/lib/settings/types';

export type NavIconId = 'dashboard' | 'coding-challenges' | 'fitforge';

export type AppNavItem = SidebarNavItemConfig & {
  icon: NavIconId;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    id: 'nav-dashboard',
    moduleId: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    description: 'Overview and quick links for your workspace.',
    visible: true,
    icon: 'dashboard',
  },
  {
    id: 'nav-coding-challenges',
    moduleId: 'coding-challenges',
    label: 'Coding Challenges',
    href: '/code',
    description: 'DSA practice track with editor and submissions.',
    visible: true,
    icon: 'coding-challenges',
  },
  {
    id: 'nav-fitforge',
    moduleId: 'fitforge',
    label: 'Fitness',
    href: '/fitforge',
    description: 'Fitness onboarding, workouts, nutrition, and coaching.',
    visible: true,
    icon: 'fitforge',
  },
];

export function isNavItemActive(pathname: string, href: string) {
  if (href === '/code') {
    return pathname === '/code' || pathname.startsWith('/code/');
  }

  if (href === '/fitforge') {
    return (
      pathname === '/fitforge' ||
      pathname.startsWith('/fitforge/') ||
      pathname === '/fitness' ||
      pathname.startsWith('/fitness/')
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
