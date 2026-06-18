export default function DashboardPage() {
  return (
    <main className="flex-1 p-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          Welcome to ThinkTank
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Open Projects to browse coding challenges, solve problems in the Python
          editor, and track your progress.
        </p>
      </div>
    </main>
  );
}
