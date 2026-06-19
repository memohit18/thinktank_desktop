'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import UserAvatar from '@/components/layout/UserAvatar';
import { clearAuthTokens, getAccessToken } from '@/lib/auth/cookies';
import { clearRefreshTimer } from '@/lib/auth/refreshToken';
import { decodeTokenPayload } from '@/lib/auth/token';
import { useGetProfileQuery } from '@/lib/services/profileApi';

type SidebarUserMenuProps = {
  collapsed?: boolean;
};

export default function SidebarUserMenu({ collapsed = false }: SidebarUserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { data: profile, isLoading } = useGetProfileQuery();

  const token = getAccessToken();
  const tokenPayload = token ? decodeTokenPayload(token) : null;
  const fallbackName = tokenPayload?.email?.split('@')[0] ?? 'User';
  const displayName = profile?.name || fallbackName;
  const profileData = profile ?? {
    name: displayName,
    email: tokenPayload?.email ?? 'user@thinktank.com',
    phone: null,
    avatar: null,
    role: tokenPayload?.role ?? 'user',
  };

  const isSettingsActive =
    pathname === '/settings' || pathname.startsWith('/settings/');

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleSignOut() {
    clearAuthTokens();
    clearRefreshTimer();
    router.push('/');
  }

  return (
    <div ref={menuRef} className="relative">
      {open ? (
        <div
          className={`absolute z-50 mb-2 w-64 rounded-xl border border-sidebar-border bg-card p-3 shadow-lg ${
            collapsed ? 'bottom-0 left-full ml-2' : 'relative mb-2 w-full'
          }`}
        >
          <div className="flex items-start gap-3 border-b border-border pb-3">
            <UserAvatar
              name={profileData.name}
              email={profileData.email}
              avatar={profileData.avatar}
              size={44}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {profileData.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {profileData.email}
              </p>
            </div>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              title="Settings"
              aria-label="Settings"
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                isSettingsActive
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <SettingsIcon className="size-4" />
            </Link>
          </div>
          <dl className="mt-3 space-y-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {profileData.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {profileData.phone ?? 'Not provided'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-0.5 font-medium capitalize text-foreground">
                {profileData.role}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
          >
            Sign out
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title={displayName}
        className={`flex w-full items-center rounded-xl text-left transition-colors hover:bg-muted ${
          collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2.5'
        }`}
      >
        {profile || !isLoading ? (
          <UserAvatar
            name={profileData.name}
            email={profileData.email}
            avatar={profileData.avatar}
            size={36}
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {isLoading ? '…' : displayName.charAt(0).toUpperCase()}
          </div>
        )}
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-text">
              {isLoading ? 'Loading...' : displayName}
            </span>
            <ChevronIcon
              className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                open ? 'rotate-180' : ''
              }`}
            />
          </>
        ) : null}
      </button>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
