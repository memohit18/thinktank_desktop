export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-2xl bg-muted" />
      <div className="h-20 rounded-2xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="h-40 rounded-2xl bg-muted" />
      </div>
      <div className="h-56 rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="h-44 rounded-2xl bg-muted" />
        <div className="h-44 rounded-2xl bg-muted" />
        <div className="h-44 rounded-2xl bg-muted" />
      </div>
      <div className="h-36 rounded-2xl bg-muted" />
    </div>
  );
}
