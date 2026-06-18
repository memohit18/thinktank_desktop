import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '@/lib/auth/cookies';
import { extractRefreshTokens, type LoginResponse } from '@/lib/auth/types';
import {
  decodeTokenPayload,
  isAccessTokenValid,
  isRefreshTokenValid,
} from '@/lib/auth/token';

let refreshPromise: Promise<string | null> | null = null;
let refreshTimer: number | null = null;

function isAuthEndpoint(url: string) {
  return url.includes('/auth/login') || url.includes('/auth/refresh');
}

export function clearRefreshTimer() {
  if (refreshTimer !== null) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

export function scheduleProactiveTokenRefresh() {
  if (typeof window === 'undefined') return;

  clearRefreshTimer();

  const accessToken = getAccessToken();
  const payload = accessToken ? decodeTokenPayload(accessToken) : null;

  if (!payload?.exp) return;

  const delay = payload.exp * 1000 - Date.now() - 60_000;

  if (delay <= 0) {
    void refreshAccessToken().then((token) => {
      if (token) scheduleProactiveTokenRefresh();
    });
    return;
  }

  refreshTimer = window.setTimeout(() => {
    void refreshAccessToken().then((token) => {
      if (token) scheduleProactiveTokenRefresh();
    });
  }, delay);
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken || !isRefreshTokenValid(refreshToken)) {
    clearAuthTokens();
    clearRefreshTimer();
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        clearAuthTokens();
        clearRefreshTimer();
        return null;
      }

      const data = (await response.json()) as LoginResponse;
      const tokens = extractRefreshTokens(data, refreshToken);
      setAuthTokens(tokens.access, tokens.refresh);
      scheduleProactiveTokenRefresh();
      return tokens.access;
    } catch {
      clearAuthTokens();
      clearRefreshTimer();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function getValidAccessToken() {
  const accessToken = getAccessToken();

  if (isAccessTokenValid(accessToken)) {
    return accessToken ?? null;
  }

  return refreshAccessToken();
}

export function shouldAttemptTokenRefresh(
  status: number | string | undefined,
  requestUrl: string,
) {
  return status === 401 && !isAuthEndpoint(requestUrl);
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const requestUrl = String(input);
  const headers = new Headers(init.headers);
  const accessToken = await getValidAccessToken();

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(input, { ...init, headers });

  if (shouldAttemptTokenRefresh(response.status, requestUrl)) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      headers.set('Authorization', `Bearer ${refreshedToken}`);
      response = await fetch(input, { ...init, headers });
    }
  }

  return response;
}

export async function ensureValidSession() {
  return (await getValidAccessToken()) !== null;
}
