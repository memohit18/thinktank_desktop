'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import SidebarUserMenu from '@/components/layout/SidebarUserMenu';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { label: 'Coding Challenges', href: '/code', icon: ProjectsIcon },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar-bg">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-logo-bg text-sm font-bold text-white">
            <TerminalIcon className="size-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-sidebar-brand">ThinkTank</p>
            <p className="text-xs text-sidebar-muted">Enterprise Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 pt-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/code'
              ? pathname === '/code' || pathname.startsWith('/code/')
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'sidebar-link-active'
                  : 'text-sidebar-text hover:bg-muted hover:text-sidebar-text-hover'
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <SidebarUserMenu />
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-text transition-colors hover:bg-muted hover:text-sidebar-text-hover"
        >
          <SettingsIcon className="size-5" />
          Settings
        </Link>
        <div className="mt-3 px-1">
          <ThemeToggle variant="sidebar" />
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 7h18" />
      <path d="M3 12h18" />
      <path d="M3 17h18" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m8 9 3 3-3 3" />
      <path d="M13 15h3" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </svg>
  );
}
