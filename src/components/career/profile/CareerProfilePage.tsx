'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import CareerApiErrorState from '@/components/career/CareerApiErrorState';
import CareerModuleShell from '@/components/career/CareerModuleShell';
import CareerProfileForm from '@/components/career/profile/CareerProfileForm';
import CareerProfileView from '@/components/career/profile/CareerProfileView';
import { useCareerProfile } from '@/hooks/useCareerProfile';
import { hasCompletedCareerOnboarding } from '@/lib/career/profileMapper';

export default function CareerProfilePage() {
  const {
    profile,
    form,
    isLoading,
    isError,
    isSaving,
    refetch,
    submitProfile,
  } = useCareerProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading && profile === null) {
    return (
      <CareerModuleShell activeNav="profile">
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </CareerModuleShell>
    );
  }

  if (isError && profile === null) {
    return (
      <CareerModuleShell activeNav="profile">
        <CareerApiErrorState
          title="Could not load career profile"
          message="Your career profile could not be loaded. Retry when your connection is available."
          onRetry={() => void refetch()}
        />
      </CareerModuleShell>
    );
  }

  const showForm = !hasCompletedCareerOnboarding(profile) || editing;

  return (
    <CareerModuleShell activeNav="profile">
      {showForm ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submitProfile().then((ok) => {
              if (ok) setEditing(false);
            });
          }}
        >
          <CareerProfileForm
            form={form}
            isSaving={isSaving}
            onCancel={
              hasCompletedCareerOnboarding(profile)
                ? () => {
                    setEditing(false);
                    if (profile) {
                      form.reset({
                        currentCompany: profile.currentCompany,
                        currentRole: profile.currentRole,
                        totalExperience: profile.totalExperience,
                        currentCtc: profile.currentCtc,
                        expectedMinCtc: profile.expectedMinCtc,
                        expectedMaxCtc: profile.expectedMaxCtc,
                        noticePeriod: profile.noticePeriod,
                        linkedinUrl: profile.linkedinUrl,
                        githubUrl: profile.githubUrl,
                        portfolioUrl: profile.portfolioUrl,
                        summary: profile.summary,
                        isActive: profile.isActive,
                      });
                    }
                  }
                : undefined
            }
            submitLabel={profile ? 'Save changes' : 'Create profile'}
          />
        </form>
      ) : profile ? (
        <CareerProfileView
          profile={profile}
          onEdit={() => setEditing(true)}
        />
      ) : null}
    </CareerModuleShell>
  );
}
