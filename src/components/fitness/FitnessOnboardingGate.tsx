'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { hasCompletedFitnessOnboarding } from '@/lib/fitness/profileMapper';
import { useGetFitnessProfileQuery } from '@/lib/services/fitnessApi';

type FitnessOnboardingGateProps = {
  children: React.ReactNode;
  allowIncomplete?: boolean;
};

export default function FitnessOnboardingGate({
  children,
  allowIncomplete = false,
}: FitnessOnboardingGateProps) {
  const router = useRouter();
  const {
    data: profile,
    isLoading,
    isUninitialized,
    isFetching,
    isError,
  } = useGetFitnessProfileQuery();

  const profileIsComplete = hasCompletedFitnessOnboarding(profile);
  const isCheckingProfile =
    isUninitialized || isLoading || (isFetching && profile === undefined && !isError);

  useEffect(() => {
    if (isCheckingProfile || allowIncomplete) return;

    if (!profileIsComplete) {
      router.replace('/fitness/setup');
    }
  }, [allowIncomplete, isCheckingProfile, profileIsComplete, router]);

  if (isCheckingProfile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowIncomplete && !profileIsComplete) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
