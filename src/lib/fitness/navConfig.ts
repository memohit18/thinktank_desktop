import {
  Dumbbell,
  LayoutDashboard,
  LineChart,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

export type FitnessModuleNavId =
  | 'transformation'
  | 'setup'
  | 'nutrition'
  | 'analytics';

export const FITNESS_MODULE_NAV_ITEMS = [
  {
    id: 'transformation' as const,
    label: 'Transformation',
    icon: Sparkles,
    href: '/fitness/transformation',
    disabled: false,
  },
  {
    id: 'setup' as const,
    label: 'My Profile',
    icon: Dumbbell,
    href: '/fitness/setup?mode=edit',
    disabled: false,
  },
  {
    id: 'nutrition' as const,
    label: 'Nutrition',
    icon: UtensilsCrossed,
    href: '#',
    disabled: true,
  },
  {
    id: 'analytics' as const,
    label: 'Analytics',
    icon: LineChart,
    href: '#',
    disabled: true,
  },
] as const;

export const FITNESS_SETUP_NAV_ITEMS = [
  {
    id: 'transformation' as const,
    label: 'Transformation',
    icon: LayoutDashboard,
    href: '/fitness/transformation',
    disabled: false,
  },
  {
    id: 'setup' as const,
    label: 'Onboarding',
    icon: Dumbbell,
    href: '/fitness/setup',
    disabled: false,
  },
  {
    id: 'nutrition' as const,
    label: 'Nutrition',
    icon: UtensilsCrossed,
    href: '#',
    disabled: true,
  },
  {
    id: 'analytics' as const,
    label: 'Analytics',
    icon: LineChart,
    href: '#',
    disabled: true,
  },
] as const;
