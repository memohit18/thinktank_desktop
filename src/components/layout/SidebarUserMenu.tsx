'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/layout/UserAvatar';
import { clearAuthTokens, getAccessToken } from '@/lib/auth/cookies';
import { clearRefreshTimer } from '@/lib/auth/refreshToken';
import { decodeTokenPayload } from '@/lib/auth/token';
import { useGetProfileQuery } from '@/lib/services/profileApi';

export default function SidebarUserMenu() {
  const router = useRouter();
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
    <div ref={menuRef} className="relative mb-3">
      {open ? (
        <div className="mb-2 rounded-xl border border-sidebar-border bg-card p-3 shadow-lg">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <UserAvatar
              name={profileData.name}
              email={profileData.email}
              avatar={profileData.avatar}
              size={44}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{profileData.name}</p>
              <p className="truncate text-xs text-muted-foreground">{profileData.email}</p>
            </div>
          </div>
          <dl className="mt-3 space-y-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-0.5 font-medium text-foreground">{profileData.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {profileData.phone ?? 'Not provided'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-0.5 font-medium capitalize text-foreground">{profileData.role}</dd>
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
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
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
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-text">
          {isLoading ? 'Loading...' : displayName}
        </span>
        <ChevronIcon
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
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
