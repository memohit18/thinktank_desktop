import { isAccessTokenValid, decodeTokenPayload } from '@/lib/auth/token';

export function getBearerToken(request: Request) {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export function requireBearerToken(request: Request) {
  const token = getBearerToken(request);

  if (!token || !isAccessTokenValid(token)) {
    return null;
  }

  return token;
}

export function getUserFromBearerToken(request: Request) {
  const token = requireBearerToken(request);
  if (!token) return null;

  const payload = decodeTokenPayload(token);
  if (!payload) return null;

  return {
    token,
    userId: payload.sub ?? 'unknown',
    email: payload.email ?? null,
    role: payload.role ?? 'user',
  };
}
