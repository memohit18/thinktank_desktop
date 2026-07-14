import type { ReactNode } from 'react';
import FitnessCoachHost from '@/components/fitness/coach/FitnessCoachHost';

export default function FitnessLayout({ children }: { children: ReactNode }) {
  return <FitnessCoachHost>{children}</FitnessCoachHost>;
}
