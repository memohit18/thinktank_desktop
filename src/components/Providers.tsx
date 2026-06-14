'use client';

import ReduxProvider from '@/providers/ReduxProvider';
import ThemeProvider from '@/providers/ThemeProvider';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </ThemeProvider>
  );
}
