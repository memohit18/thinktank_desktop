import Cookies from 'js-cookie';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

const cookieOptions: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

export function setAuthTokens(accessToken: string, refreshToken: string) {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    ...cookieOptions,
    expires: 1,
  });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...cookieOptions,
    expires: 30,
  });
}

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function clearAuthTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
}
