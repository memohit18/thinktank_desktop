import {
  CalendarDays,
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
  | 'meals'
  | 'progress'
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
    id: 'meals' as const,
    label: 'Meals',
    icon: CalendarDays,
    href: '/fitness/meals',
    disabled: false,
  },
  {
    id: 'progress' as const,
    label: 'Progress',
    icon: LineChart,
    href: '/fitness/progress',
    disabled: false,
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
    id: 'meals' as const,
    label: 'Meals',
    icon: CalendarDays,
    href: '/fitness/meals',
    disabled: false,
  },
  {
    id: 'progress' as const,
    label: 'Progress',
    icon: LineChart,
    href: '/fitness/progress',
    disabled: false,
  },
] as const;
