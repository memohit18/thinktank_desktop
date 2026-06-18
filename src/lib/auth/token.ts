export type TokenPayload = {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
};

export function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    const [, payload] = token.split('.');

    if (!payload) return null;

    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

export function isAccessTokenValid(token: string | undefined | null) {
  if (!token) return false;

  const payload = decodeTokenPayload(token);

  if (!payload?.exp) return false;

  return payload.exp * 1000 > Date.now();
}

export function isRefreshTokenValid(token: string | undefined | null) {
  if (!token) return false;

  const payload = decodeTokenPayload(token);

  if (!payload?.exp) return true;

  return payload.exp * 1000 > Date.now();
}
