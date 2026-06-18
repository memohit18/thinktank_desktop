import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-auth-bg">
      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="relative hidden overflow-hidden bg-auth-panel px-12 py-10 lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
          <div className="auth-circuit pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-40" />

          <div className="relative z-10">
            <p className="text-2xl font-bold tracking-tight text-accent">
              ThinkTank
            </p>
          </div>

          <div className="relative z-10 max-w-lg space-y-6">
            <div className="h-1 w-12 rounded-full bg-accent" />
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-auth-panel-foreground">
              Advanced Protection for the Enterprise Era
            </h2>
            <p className="text-base leading-relaxed text-auth-panel-muted">
              Experience lightning-fast authentication combined with
              military-grade encryption standards.
            </p>
          </div>

          <div className="relative z-10" />
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 lg:px-12">
          <p className="mb-6 text-2xl font-bold text-accent lg:hidden">ThinkTank</p>
          {children}
        </main>
      </div>

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-border px-6 py-4 text-xs text-muted-foreground sm:flex-row">
        <span className="font-medium">ThinkTank</span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="#" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-foreground">
            Security Whitepaper
          </Link>
        </div>
        <span>© 2026 ThinkTank Systems. All rights reserved.</span>
      </footer>
    </div>
  );
}

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="auth-card w-full max-w-md rounded-2xl border border-border bg-auth-card p-8 shadow-2xl ring-1 ring-accent/10 dark:ring-neon/20">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-foreground/70">
            {subtitle}
          </p>
        </div>
        <ThemeToggle />
      </div>

      {children}
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-auth-card px-3 text-muted-foreground">or</span>
      </div>
    </div>
  );
}
