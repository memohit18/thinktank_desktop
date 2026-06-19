'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import UserAvatar from '@/components/layout/UserAvatar';
import { useToast } from '@/components/ui/Toast';
import type { UserProfileDetail } from '@/lib/settings/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/lib/services/profileApi';
import { useSettings } from '@/providers/SettingsProvider';

const inputClassName =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60';

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
};

export default function ProfileSettingsSection() {
  const { showToast } = useToast();
  const { userProfile, updateUserProfile } = useSettings();
  const { data: apiProfile, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const sourceProfile = useMemo<UserProfileDetail>(() => {
    if (apiProfile) {
      return {
        name: apiProfile.name,
        email: apiProfile.email,
        phone: apiProfile.phone ?? '',
        role: apiProfile.role,
        avatar: apiProfile.avatar,
      };
    }

    return userProfile;
  }, [apiProfile, userProfile]);

  const [form, setForm] = useState<ProfileFormState>({
    name: sourceProfile.name,
    email: sourceProfile.email,
    phone: sourceProfile.phone,
  });

  useEffect(() => {
    setForm({
      name: sourceProfile.name,
      email: sourceProfile.email,
      phone: sourceProfile.phone,
    });
  }, [sourceProfile]);

  const isDirty =
    form.name !== sourceProfile.name ||
    form.phone !== sourceProfile.phone;

  function handleCancelEdit() {
    setForm({
      name: sourceProfile.name,
      email: sourceProfile.email,
      phone: sourceProfile.phone,
    });
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isDirty || isSaving) return;

    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();

    if (!trimmedName) {
      showToast('Name is required.', 'error');
      return;
    }

    try {
      await updateProfile({
        name: trimmedName,
        phone: trimmedPhone || null,
      }).unwrap();

      updateUserProfile({
        name: trimmedName,
        phone: trimmedPhone,
      });
      showToast('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      updateUserProfile({
        name: trimmedName,
        phone: trimmedPhone,
      });
      showToast(
        apiProfile
          ? getApiErrorMessage(error, 'Failed to update profile.')
          : 'Profile updated locally.',
        apiProfile ? 'error' : 'success',
      );
      setIsEditing(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Your profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View your account details. Click edit to update your name or phone.
        </p>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <UserAvatar
              name={form.name || sourceProfile.name}
              email={sourceProfile.email}
              avatar={sourceProfile.avatar}
              size={64}
            />
            <div>
              <p className="text-base font-semibold text-foreground">
                {form.name || sourceProfile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {sourceProfile.email}
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Edit
            </button>
          ) : null}
        </div>

        <div className="space-y-5 p-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="profile-name">
              {isEditing ? (
                <input
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={isSaving}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              ) : (
                <ReadOnlyValue value={sourceProfile.name} />
              )}
            </Field>

            <Field label="Email address" htmlFor="profile-email">
              <ReadOnlyValue value={sourceProfile.email} />
              {isEditing ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Contact your admin to change your email.
                </p>
              ) : null}
            </Field>
          </div>

          <Field label="Phone number" htmlFor="profile-phone">
            {isEditing ? (
              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                disabled={isSaving}
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="+91 98765 43210"
                className={inputClassName}
              />
            ) : (
              <ReadOnlyValue
                value={sourceProfile.phone || 'Not provided'}
                muted={!sourceProfile.phone}
              />
            )}
          </Field>
        </div>

        {isEditing ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-black"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        ) : null}
      </form>
    </section>
  );
}

function ReadOnlyValue({
  value,
  muted = false,
}: {
  value: string;
  muted?: boolean;
}) {
  return (
    <p
      className={`rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm ${
        muted ? 'text-muted-foreground' : 'text-foreground'
      }`}
    >
      {value}
    </p>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
