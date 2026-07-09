import { TIPS_SECTION_ICON, TRANSFORMATION_TIPS } from '@/lib/fitness/transformation/constants';

export default function TipsCard() {
  const SectionIcon = TIPS_SECTION_ICON;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <SectionIcon className="size-5 text-accent" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daily Focus</h2>
          <p className="text-sm text-muted-foreground">
            Recommendations to stay on track this week.
          </p>
        </div>
      </div>

      <ul className="space-y-4">
        {TRANSFORMATION_TIPS.map((tip) => {
          const Icon = tip.icon;
          return (
            <li key={tip.id} className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {tip.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
