import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getRequestAccessToken,
  isAuthRoute,
  isProtectedRoute,
} from '@/lib/auth/routeGuard';
import { isAccessTokenValid } from '@/lib/auth/token';
import { resolveProxyTarget } from '@/lib/proxy/config';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const proxyTarget = resolveProxyTarget(pathname, search);

  if (proxyTarget) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete('host');

    if (!requestHeaders.get('authorization')) {
      const accessToken = getRequestAccessToken(request);
      if (accessToken) {
        requestHeaders.set('Authorization', `Bearer ${accessToken}`);
      }
    }

    return NextResponse.rewrite(proxyTarget, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  const accessToken = getRequestAccessToken(request);
  const isAuthenticated = isAccessTokenValid(accessToken);

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (
    accessToken &&
    !isAuthenticated &&
    (isProtectedRoute(pathname) || isAuthRoute(pathname))
  ) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/signup',
    '/dashboard',
    '/dashboard/:path*',
    '/code',
    '/code/:path*',
    '/api/auth/:path*',
    '/api/questions/:path*',
    '/api/profile',
    '/api/user-progress/:path*',
    '/api/code/:path*',
  ],
};
