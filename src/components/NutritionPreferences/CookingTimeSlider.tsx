'use client';

type CookingTimeSliderProps = {
  value?: number;
  onChange: (value: number) => void;
  error?: string;
};

export default function CookingTimeSlider({
  value,
  onChange,
  error,
}: CookingTimeSliderProps) {
  const hasValue = typeof value === 'number';

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Cooking time</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the maximum prep and cooking time you are comfortable with.
          </p>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
          {hasValue ? `${value} min` : 'Not set'}
        </div>
      </div>

      <div className="mt-5">
        <input
          aria-label="Cooking time in minutes"
          type="range"
          min={15}
          max={120}
          step={5}
          value={value ?? 15}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-accent"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>15 min</span>
          <span>120 min</span>
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
