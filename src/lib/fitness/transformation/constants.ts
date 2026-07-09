import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Calculator,
  Droplets,
  Dumbbell,
  Flame,
  Lightbulb,
  Moon,
  Scale,
  Target,
  TrendingDown,
  Zap,
} from 'lucide-react';

export const TRANSFORMATION_TIPS = [
  {
    id: 'hydration',
    title: 'Hydration',
    description:
      'Stay hydrated: aim for at least 3.5L of water today to support metabolism and recovery.',
    icon: Droplets,
  },
  {
    id: 'protein',
    title: 'Protein intake',
    description:
      'Consume enough protein at each meal to preserve lean mass during your transformation.',
    icon: Dumbbell,
  },
  {
    id: 'sleep',
    title: 'Sleep quality',
    description:
      'Aim for 7–8 hours of rest for optimal recovery and hormone balance.',
    icon: Moon,
  },
  {
    id: 'consistency',
    title: 'Consistency',
    description:
      'Maintain workout consistency — small daily habits compound into major results.',
    icon: Activity,
  },
] as const;

export const TIMELINE_MILESTONES = [
  { week: 1, label: 'Kickoff' },
  { week: 4, label: 'Adaptation' },
  { week: 8, label: 'Momentum' },
  { week: 12, label: 'Breakthrough' },
] as const;

export type MetricDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  getValue: (data: {
    bmi: number;
    bmr: number;
    tdee: number;
    dailyCalories: number;
    dailyProtein: number;
  }) => string;
  getBadge?: (data: { bmi: number }) => { label: string; tone: 'success' | 'warning' | 'danger' } | undefined;
};

export const BODY_METRICS: MetricDefinition[] = [
  {
    id: 'bmi',
    label: 'BMI',
    description: 'Body Mass Index based on current height & weight.',
    icon: Scale,
    getValue: ({ bmi }) => bmi.toFixed(1),
    getBadge: ({ bmi }) => {
      if (bmi <= 0) return undefined;
      if (bmi < 18.5) return { label: 'Underweight', tone: 'warning' };
      if (bmi < 25) return { label: 'Healthy', tone: 'success' };
      if (bmi < 30) return { label: 'Overweight', tone: 'warning' };
      return { label: 'High', tone: 'danger' };
    },
  },
  {
    id: 'bmr',
    label: 'BMR',
    description: 'Calories burned at rest (Basal Metabolic Rate).',
    icon: Flame,
    getValue: ({ bmr }) => String(Math.round(bmr)),
  },
  {
    id: 'tdee',
    label: 'TDEE',
    description: 'Total Daily Energy Expenditure with activity level.',
    icon: Zap,
    getValue: ({ tdee }) => String(Math.round(tdee)),
  },
  {
    id: 'calories',
    label: 'Target',
    description: 'Daily intake calibrated for your transformation goal.',
    icon: Target,
    getValue: ({ dailyCalories }) => String(Math.round(dailyCalories)),
  },
  {
    id: 'protein',
    label: 'Protein',
    description: 'Optimized to preserve muscle mass during your plan.',
    icon: Dumbbell,
    getValue: ({ dailyProtein }) => `${Math.round(dailyProtein)}g`,
  },
];

export const NUTRITION_SUMMARY_ITEMS = [
  {
    id: 'calories',
    label: 'Daily Calories',
    icon: Calculator,
    getValue: (t: { dailyCalories: number }) => `${Math.round(t.dailyCalories)} kcal`,
  },
  {
    id: 'protein',
    label: 'Daily Protein',
    icon: Dumbbell,
    getValue: (t: { dailyProtein: number }) => `${Math.round(t.dailyProtein)}g`,
  },
  {
    id: 'loss',
    label: 'Expected Change',
    icon: TrendingDown,
    getValue: (t: { currentWeightKg: number; targetWeightKg: number; estimatedWeeks: number }) => {
      const delta = t.targetWeightKg - t.currentWeightKg;
      const weekly = t.estimatedWeeks > 0 ? delta / t.estimatedWeeks : 0;
      const sign = weekly > 0 ? '+' : '';
      return `${sign}${weekly.toFixed(1)} kg / wk`;
    },
  },
] as const;

export const TIPS_SECTION_ICON = Lightbulb;
