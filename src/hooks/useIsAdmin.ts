'use client';

import { getAccessToken } from '@/lib/auth/cookies';
import { decodeTokenPayload } from '@/lib/auth/token';

export function useIsAdmin() {
  const token = getAccessToken();
  const role = token ? decodeTokenPayload(token)?.role : null;
  return role === 'admin';
}
