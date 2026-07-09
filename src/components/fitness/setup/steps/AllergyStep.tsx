'use client';

import { FormTextarea, StepSection } from '@/components/fitness/setup/FormFields';
import { ALLERGY_QUICK_TAGS } from '@/lib/fitness/stepMeta';
import type { FitnessSetupForm } from '@/hooks/useFitnessSetup';

type AllergyStepProps = {
  form: FitnessSetupForm;
  error?: string;
};

function appendTag(current: string, tag: string) {
  const items = current
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.some((item) => item.toLowerCase() === tag.toLowerCase())) {
    return current;
  }

  return items.length > 0 ? `${current}, ${tag}` : tag;
}

export default function AllergyStep({ form, error }: AllergyStepProps) {
  const { watch, setValue } = form;
  const allergies = watch('allergies');

  return (
    <StepSection>
      <FormTextarea
        label="Allergies or Intolerances"
        value={allergies}
        onChange={(value) => setValue('allergies', value, { shouldDirty: true })}
        placeholder="e.g. Peanuts, Shellfish, Lactose intolerance"
        hint="Optional. Separate multiple items with commas."
        error={error}
      />

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quick Select
        </p>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setValue('allergies', appendTag(allergies, tag), {
                  shouldDirty: true,
                })
              }
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </StepSection>
  );
}
