'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from '@/components/ui/Toast';
import AuthProvider from '@/providers/AuthProvider';
import ReduxProvider from '@/providers/ReduxProvider';
import ThemeProvider from '@/providers/ThemeProvider';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ReduxProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReduxProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!googleClientId) {
    return <AppProviders>{children}</AppProviders>;
  }

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ToastProvider>
          <ReduxProvider>
            <AuthProvider>{children}</AuthProvider>
          </ReduxProvider>
        </ToastProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
