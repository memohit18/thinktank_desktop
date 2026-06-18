import { Suspense } from 'react';
import AuthScreen from '@/components/AuthScreen';

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AuthScreen />
    </Suspense>
  );
}
