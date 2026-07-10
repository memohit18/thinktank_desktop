export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-52 rounded-2xl bg-muted" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <div className="h-12 rounded-full bg-muted" />
          <div className="h-36 rounded-2xl bg-muted" />
          <div className="h-36 rounded-2xl bg-muted" />
          <div className="h-36 rounded-2xl bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="h-56 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
