import {
  Dumbbell,
  LayoutDashboard,
  LineChart,
  Salad,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

export type FitnessModuleNavId =
  | 'transformation'
  | 'setup'
  | 'nutrition'
  | 'diet'
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
    href: '/fitness/food-preferences',
    disabled: false,
  },
  {
    id: 'diet' as const,
    label: 'Diet',
    icon: Salad,
    href: '/fitness/diet',
    disabled: false,
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
    href: '/fitness/food-preferences',
    disabled: false,
  },
  {
    id: 'diet' as const,
    label: 'Diet',
    icon: Salad,
    href: '/fitness/diet',
    disabled: false,
  },
  {
    id: 'analytics' as const,
    label: 'Analytics',
    icon: LineChart,
    href: '#',
    disabled: true,
  },
] as const;
