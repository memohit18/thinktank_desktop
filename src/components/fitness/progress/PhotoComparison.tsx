'use client';

import { useMemo, useState } from 'react';
import type { ProgressPhotoSet } from '@/lib/fitness/progress/types';

type PhotoComparisonProps = {
  photos: ProgressPhotoSet[];
};

type Angle = 'front' | 'side' | 'back';

function urlForAngle(set: ProgressPhotoSet, angle: Angle) {
  if (angle === 'front') return set.frontImageUrl;
  if (angle === 'side') return set.sideImageUrl;
  return set.backImageUrl;
}

export default function PhotoComparison({ photos }: PhotoComparisonProps) {
  const [angle, setAngle] = useState<Angle>('front');
  const [slider, setSlider] = useState(50);

  const angled = useMemo(
    () =>
      [...photos]
        .reverse()
        .filter((set) => Boolean(urlForAngle(set, angle))),
    [angle, photos],
  );

  const before = angled[0] ?? null;
  const after = angled[angled.length - 1] ?? null;
  const canCompare = Boolean(
    before && after && before.id !== after.id && urlForAngle(before, angle) && urlForAngle(after, angle),
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Comparison Slider
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Compare earliest and latest photos for each angle.
          </p>
        </div>
        <div className="flex gap-2">
          {(['front', 'side', 'back'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setAngle(item);
                setSlider(50);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                angle === item
                  ? 'border-accent bg-accent text-accent-foreground dark:text-black'
                  : 'border-border bg-muted/30 text-muted-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {!canCompare ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Upload at least two {angle} photos to unlock comparison.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlForAngle(after!, angle)!}
              alt={`After ${angle}`}
              className="absolute inset-0 size-full object-cover"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${slider}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlForAngle(before!, angle)!}
                alt={`Before ${angle}`}
                className="absolute inset-0 size-full max-w-none object-cover"
                style={{ width: `${10000 / Math.max(slider, 1)}%` }}
              />
            </div>
            <div
              className="absolute inset-y-0 w-0.5 bg-accent"
              style={{ left: `${slider}%` }}
            />
          </div>
          <input
            type="range"
            min={5}
            max={95}
            value={slider}
            onChange={(event) => setSlider(Number(event.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Before · {before!.recordedAt.slice(0, 10)}</span>
            <span>After · {after!.recordedAt.slice(0, 10)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
