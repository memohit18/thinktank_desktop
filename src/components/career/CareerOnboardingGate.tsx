'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { hasCompletedCareerOnboarding } from '@/lib/career/profileMapper';
import { RTK_QUERY_STABLE_CACHE } from '@/lib/services/rtkQueryDefaults';
import { useGetCareerProfileQuery } from '@/lib/services/careerApi';

type CareerOnboardingGateProps = {
  children: React.ReactNode;
  allowIncomplete?: boolean;
};

export default function CareerOnboardingGate({
  children,
  allowIncomplete = false,
}: CareerOnboardingGateProps) {
  const router = useRouter();
  const {
    data: profile,
    isLoading,
    isUninitialized,
    isFetching,
    isError,
  } = useGetCareerProfileQuery(undefined, RTK_QUERY_STABLE_CACHE);

  const profileIsComplete = hasCompletedCareerOnboarding(profile);
  const isCheckingProfile =
    isUninitialized ||
    isLoading ||
    (isFetching && profile === undefined && !isError);

  useEffect(() => {
    if (isCheckingProfile || allowIncomplete) return;

    if (!profileIsComplete) {
      router.replace('/career/profile');
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
