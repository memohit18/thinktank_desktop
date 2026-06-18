export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
};

export function extractAuthTokens(response: LoginResponse) {
  const access =
    response.access ??
    response.access_token ??
    response.accessToken;
  const refresh =
    response.refresh ??
    response.refresh_token ??
    response.refreshToken;

  if (!access || !refresh) {
    throw new Error('Invalid login response. Tokens were not returned.');
  }

  return { access, refresh };
}
