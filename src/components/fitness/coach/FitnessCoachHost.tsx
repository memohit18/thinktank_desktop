'use client';

import type { ReactNode } from 'react';
import FloatingCoach from '@/components/fitness/coach/FloatingCoach';

type FitnessCoachHostProps = {
  children: ReactNode;
};

/** Keeps the AI coach mounted across fitness routes so /ai/history is not aborted on nav. */
export default function FitnessCoachHost({ children }: FitnessCoachHostProps) {
  return (
    <>
      {children}
      <FloatingCoach />
    </>
  );
}
