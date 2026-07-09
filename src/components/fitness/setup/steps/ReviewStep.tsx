'use client';

import ReviewCard from '@/components/fitness/setup/ReviewCard';
import { StepSection } from '@/components/fitness/setup/FormFields';
import { buildFitnessReviewSections } from '@/lib/fitness/reviewLabels';
import type { FitnessSetupFormValues } from '@/lib/fitness/types';
import type { FitnessSetupStepId, PhysiqueGoal } from '@/lib/fitness/types';

type ReviewStepProps = {
  values: FitnessSetupFormValues;
  physiqueGoals: PhysiqueGoal[];
  onEdit: (step: FitnessSetupStepId) => void;
};

export default function ReviewStep({
  values,
  physiqueGoals,
  onEdit,
}: ReviewStepProps) {
  const sections = buildFitnessReviewSections(values, physiqueGoals);

  return (
    <StepSection>
      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {section.title}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <ReviewCard
                  key={`${section.id}-${item.label}`}
                  title={item.label}
                  value={item.value}
                  onEdit={() => onEdit(section.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepSection>
  );
}
