'use client';

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-56 rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 rounded-2xl bg-muted" />
        <div className="h-56 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
