import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getRequestAccessToken,
  getRequestRefreshToken,
  hasValidSession,
  isAuthRoute,
  isProtectedRoute,
} from '@/lib/auth/routeGuard';
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
  const refreshToken = getRequestRefreshToken(request);
  const hasSession = hasValidSession(request);

  if (isProtectedRoute(pathname) && !hasSession) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    if (accessToken || refreshToken) {
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
    }
    return response;
  }

  if (isAuthRoute(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
    '/fitforge',
    '/fitforge/:path*',
    '/fitness',
    '/fitness/:path*',
    '/settings',
    '/settings/:path*',
    '/api/auth/:path*',
    '/api/questions/:path*',
    '/api/profile',
    '/api/user-progress/:path*',
    '/api/roadmaps/:path*',
    '/api/fitness/:path*',
    '/api/transformation/:path*',
    '/api/foods',
    '/api/foods/:path*',
    '/api/food-preferences',
    '/api/food-preferences/:path*',
    '/api/nutrition-preferences',
    '/api/nutrition-preferences/:path*',
    '/api/diet',
    '/api/diet/:path*',
    '/api/meal-plans',
    '/api/meal-plans/:path*',
    '/api/progress',
    '/api/progress/:path*',
    '/api/checkins',
    '/api/checkins/:path*',
    '/api/meals',
    '/api/meals/:path*',
    '/api/workouts',
    '/api/workouts/:path*',
    '/api/hydration',
    '/api/hydration/:path*',
    '/api/ai',
    '/api/ai/:path*',
    '/api/uploads',
    '/api/uploads/:path*',
    '/api/code/:path*',
  ],
};
