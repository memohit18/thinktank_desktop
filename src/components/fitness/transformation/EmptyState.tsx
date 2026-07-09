import { Sparkles } from 'lucide-react';
import GenerateButton from '@/components/fitness/transformation/GenerateButton';

type EmptyStateProps = {
  isGenerating?: boolean;
  onGenerate: () => void;
  description?: string;
};

export default function EmptyState({
  isGenerating = false,
  onGenerate,
  description = 'Generate your personalized transformation roadmap based on your fitness profile, goals, and metabolism.',
}: EmptyStateProps) {
  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Sparkles className="size-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-foreground">
        No Transformation Plan Found
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-8">
        <GenerateButton
          label="Generate Transformation Plan"
          isLoading={isGenerating}
          onClick={onGenerate}
        />
      </div>
    </section>
  );
}
