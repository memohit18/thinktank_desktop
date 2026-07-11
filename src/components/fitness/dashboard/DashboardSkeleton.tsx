'use client';

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-44 rounded-2xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="h-40 rounded-2xl bg-muted" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="h-56 rounded-2xl bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
