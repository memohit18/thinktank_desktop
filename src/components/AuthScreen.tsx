'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import AuthLayout, {
  AuthCard,
  AuthDivider,
} from '@/components/auth/AuthLayout';
import AuthModeToggle from '@/components/auth/AuthModeToggle';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/providers/AuthProvider';
import { setAuthTokens } from '@/lib/auth/cookies';
import { scheduleProactiveTokenRefresh } from '@/lib/auth/refreshToken';
import { extractAuthTokens } from '@/lib/auth/types';
import { useLoginMutation } from '@/lib/services/authApi';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';

const inputClassName =
  'auth-input w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors disabled:opacity-60';

export default function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { refreshSession } = useAuth();
  const [login, { isLoading }] = useLoginMutation();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    try {
      const response = await login({ email, password }).unwrap();
      const tokens = extractAuthTokens(response);

      setAuthTokens(tokens.access, tokens.refresh);
      scheduleProactiveTokenRefresh();
      await refreshSession();
      showToast('Login successful!');

      window.setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Login failed. Please check your credentials and try again.',
      );

      setErrorMessage(message);
      showToast(message, 'error');
    }
  }

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      const message = 'Passwords do not match.';
      setErrorMessage(message);
      showToast(message, 'error');
      return;
    }

    showToast('Sign up is not connected yet.', 'error');
  }

  const isLogin = mode === 'login';

  return (
    <AuthLayout>
      <AuthCard
        title={isLogin ? 'Welcome Back' : 'Create Account'}
        subtitle={
          isLogin
            ? 'Please enter your credentials to access your secure portal.'
            : 'Request access to your secure ThinkTank portal.'
        }
      >
        <AuthModeToggle mode={mode} onChange={setMode} />

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {errorMessage ? <AuthError message={errorMessage} /> : null}

            <AuthField label="Email Address" htmlFor="email">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@securecore.tech"
                  className={`${inputClassName} pr-10`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
              </div>
            </AuthField>

            <AuthField
              label="Password"
              htmlFor="password"
              action={
                <button
                  type="button"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Forgot password?
                </button>
              }
            >
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className={`${inputClassName} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </AuthField>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading ? <ArrowIcon /> : null}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-5">
            {errorMessage ? <AuthError message={errorMessage} /> : null}

            <AuthField label="Full Name" htmlFor="name">
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
                className={inputClassName}
              />
            </AuthField>

            <AuthField label="Email Address" htmlFor="signup-email">
              <div className="relative">
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@securecore.tech"
                  className={`${inputClassName} pr-10`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
              </div>
            </AuthField>

            <AuthField label="Password" htmlFor="signup-password">
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className={`${inputClassName} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </AuthField>

            <AuthField label="Confirm Password" htmlFor="confirm-password">
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                className={inputClassName}
              />
            </AuthField>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Create Account
            </button>
          </form>
        )}

        <div className="mt-6 space-y-4">
          <AuthDivider />
          <GoogleSignInButton
            label={isLogin ? 'Continue with Google' : 'Sign up with Google'}
          />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

function AuthField({
  label,
  htmlFor,
  action,
  children,
}: {
  label: string;
  htmlFor: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="auth-label text-sm font-semibold">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

function AuthError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-500 dark:text-red-400"
    >
      {message}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
