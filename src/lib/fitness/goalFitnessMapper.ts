import type { FitnessGoal } from '@/lib/fitness/types';

const PHYSIQUE_TO_FITNESS_GOAL: Record<string, FitnessGoal> = {
  athletic: 'body_recomposition',
  bodybuilder: 'muscle_gain',
  lean: 'lean_bulk',
  muscular: 'lean_bulk',
  powerlifter: 'muscle_gain',
  slim: 'weight_loss',
};

export function mapPhysiqueGoalToFitnessGoal(physiqueGoalId: string): FitnessGoal {
  return PHYSIQUE_TO_FITNESS_GOAL[physiqueGoalId] ?? 'maintain_weight';
}
