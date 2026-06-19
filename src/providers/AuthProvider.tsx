'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getAccessToken, getRefreshToken } from '@/lib/auth/cookies';
import { isAccessTokenValid, isRefreshTokenValid } from '@/lib/auth/token';
import {
  ensureValidSession,
  refreshAccessToken,
  scheduleProactiveTokenRefresh,
} from '@/lib/auth/refreshToken';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  ensureSession: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  syncSessionFromCookies: () => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refreshSession = useCallback(async () => {
    const hasSession = (await refreshAccessToken()) !== null;
    setStatus(hasSession ? 'authenticated' : 'anonymous');
    return hasSession;
  }, []);

  const ensureSession = useCallback(async () => {
    const hasSession = await ensureValidSession();
    setStatus(hasSession ? 'authenticated' : 'anonymous');
    return hasSession;
  }, []);

  const syncSessionFromCookies = useCallback(() => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const hasSession =
      isAccessTokenValid(accessToken) || isRefreshTokenValid(refreshToken);

    setStatus(hasSession ? 'authenticated' : 'anonymous');
    return hasSession;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken = getRefreshToken();

      if (!refreshToken || !isRefreshTokenValid(refreshToken)) {
        if (!cancelled) setStatus('anonymous');
        return;
      }

      const hasSession = await ensureValidSession();

      if (cancelled) return;

      setStatus(hasSession ? 'authenticated' : 'anonymous');

      if (hasSession) {
        scheduleProactiveTokenRefresh();
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      ensureSession,
      refreshSession,
      syncSessionFromCookies,
    }),
    [status, ensureSession, refreshSession, syncSessionFromCookies],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export default AuthProvider;
