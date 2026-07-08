'use client';

export default function FitnessModulePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col p-6 lg:p-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Fitness
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Your fitness hub
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          This module is being rebuilt from scratch. Features will be added here
          one by one.
        </p>
      </header>

      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-10">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-2xl">
            🏋️
          </div>
          <p className="mt-4 text-base font-semibold text-foreground">
            Nothing here yet
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Workouts, nutrition, progress tracking, and coaching will show up in
            this space as they are implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
