'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SidebarUserMenu from '@/components/layout/SidebarUserMenu';
import {
  APP_NAV_ITEMS,
  isNavItemActive,
  type NavIconId,
} from '@/lib/settings/navConfig';
import { useSidebar } from '@/providers/SidebarProvider';
import { useSettings } from '@/providers/SettingsProvider';

export default function AppSidebar() {
  const pathname = usePathname();
  const { pinned, togglePinned } = useSidebar();
  const { visibleNavItems } = useSettings();
  const [isHovered, setIsHovered] = useState(false);

  const expanded = pinned || isHovered;
  const collapsed = !expanded;
  const isOverlay = expanded && !pinned;

  const navItems = APP_NAV_ITEMS.filter((item) =>
    visibleNavItems.some((visibleItem) => visibleItem.id === item.id),
  );

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed inset-y-0 left-0 flex flex-col border-r border-sidebar-border bg-sidebar-bg transition-[width,box-shadow] duration-200 ${
        expanded ? 'w-64' : 'w-[4.5rem]'
      } ${isOverlay ? 'z-50 shadow-2xl' : 'z-40'}`}
    >
      <div
        className={`flex items-center border-b border-sidebar-border ${
          collapsed ? 'justify-center px-2 py-4' : 'justify-between gap-2 px-4 py-5'
        }`}
      >
        <Link
          href="/dashboard"
          className={`flex min-w-0 items-center ${collapsed ? '' : 'gap-3'}`}
          title="ThinkTank"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-logo-bg text-sm font-bold text-white">
            <TerminalIcon className="size-5 text-white" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-sidebar-brand">
                ThinkTank
              </p>
              <p className="truncate text-xs text-sidebar-muted">
                Enterprise Portal
              </p>
            </div>
          ) : null}
        </Link>

        {!collapsed ? (
          <button
            type="button"
            onClick={togglePinned}
            aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            aria-pressed={pinned}
            title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              pinned
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <PinIcon className="size-4" filled={pinned} />
          </button>
        ) : null}
      </div>

      <nav
        className={`min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden pt-4 ${
          collapsed ? 'px-2' : 'px-3'
        }`}
      >
        {navItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              className={`flex items-center rounded-xl text-sm font-medium transition-colors ${
                collapsed
                  ? 'justify-center px-0 py-2.5'
                  : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'sidebar-link-active'
                  : 'text-sidebar-text hover:bg-muted hover:text-sidebar-text-hover'
              }`}
            >
              <NavIcon icon={item.icon} className="size-5 shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={`shrink-0 space-y-2 border-t border-sidebar-border ${
          collapsed ? 'p-2' : 'p-3'
        }`}
      >
        <SidebarUserMenu collapsed={collapsed} />
        <ThemeToggle variant="sidebar" collapsed={collapsed} />
      </div>
    </aside>
  );
}

function NavIcon({
  icon,
  className,
}: {
  icon: NavIconId;
  className?: string;
}) {
  if (icon === 'dashboard') {
    return <DashboardIcon className={className} />;
  }

  if (icon === 'fitforge') {
    return <FitForgeIcon className={className} />;
  }

  return <ProjectsIcon className={className} />;
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

function FitForgeIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 3v18" />
      <path d="M8 7h8" />
      <path d="M7 12h10" />
      <path d="M9 17h6" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function PinIcon({
  className,
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  if (filled) {
    return (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16 3v2.2l1.6 1.6-1.4 1.4-1.6-1.6H12v10.8l1.6 1.6-1.4 1.4L9 18.8V7.6H7.4L5.8 9.2 4.4 7.8 6 6.2V3h10z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 17v5" />
      <path d="M9 3h6v5l4.5 4.5a2.1 2.1 0 0 1-2.9 2.9L12 12V3z" />
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
