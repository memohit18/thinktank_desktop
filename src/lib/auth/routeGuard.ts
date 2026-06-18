import { ACCESS_TOKEN_KEY } from '@/lib/auth/cookies';
import { isAccessTokenValid } from '@/lib/auth/token';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/code'];
const authRoutes = ['/', '/signup'];

export function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAuthRoute(pathname: string) {
  return authRoutes.includes(pathname);
}

export function getRequestAccessToken(request: NextRequest) {
  return request.cookies.get(ACCESS_TOKEN_KEY)?.value;
}

export function hasValidAccessToken(request: NextRequest) {
  return isAccessTokenValid(getRequestAccessToken(request));
}
