'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Camera } from 'lucide-react';
import UserAvatar from '@/components/layout/UserAvatar';
import ProfileAvatarPicker from '@/components/settings/ProfileAvatarPicker';
import { useToast } from '@/components/ui/Toast';
import type { UserProfileDetail } from '@/lib/settings/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/lib/services/profileApi';
import { useSettings } from '@/providers/SettingsProvider';
import { useExclusiveAction } from '@/hooks/useExclusiveAction';

const inputClassName =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60';

const DEFAULT_COUNTRY_CODE = '+91';

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA / Canada (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+86', label: 'China (+86)' },
] as const;

type CountryCode = (typeof COUNTRY_CODES)[number]['code'];

function splitPhone(phone: string | null | undefined): {
  countryCode: CountryCode;
  nationalNumber: string;
} {
  const trimmed = (phone ?? '').trim();
  if (!trimmed) {
    return { countryCode: DEFAULT_COUNTRY_CODE, nationalNumber: '' };
  }

  const sortedCodes = [...COUNTRY_CODES]
    .map((item) => item.code)
    .sort((a, b) => b.length - a.length);

  const withPlus = trimmed.startsWith('+')
    ? trimmed
    : trimmed.replace(/^00/, '+');

  for (const code of sortedCodes) {
    if (withPlus.startsWith(code)) {
      return {
        countryCode: code,
        nationalNumber: withPlus.slice(code.length).replace(/^[\s-]+/, ''),
      };
    }
  }

  const digits = trimmed.replace(/[\s()-]/g, '');
  if (/^91\d{10}$/.test(digits)) {
    return {
      countryCode: '+91',
      nationalNumber: digits.slice(2),
    };
  }

  return {
    countryCode: DEFAULT_COUNTRY_CODE,
    nationalNumber: trimmed.replace(/^0+/, ''),
  };
}

function composePhone(countryCode: string, nationalNumber: string) {
  const local = nationalNumber.trim().replace(/^0+/, '');
  if (!local) return '';
  return `${countryCode} ${local}`.replace(/\s+/g, ' ').trim();
}

type ProfileFormState = {
  name: string;
  email: string;
  countryCode: CountryCode;
  nationalNumber: string;
  avatar: string | null;
  avatarImageId: string | null;
};

function formPhone(form: Pick<ProfileFormState, 'countryCode' | 'nationalNumber'>) {
  return composePhone(form.countryCode, form.nationalNumber);
}

export default function ProfileSettingsSection() {
  const { showToast } = useToast();
  const { userProfile, updateUserProfile } = useSettings();
  const { data: apiProfile, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { isLocked: isSaveLocked, runExclusive } = useExclusiveAction({
    cooldownMs: 600,
  });
  const saveBusy = isSaving || isSaveLocked;

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

  const sourcePhoneParts = useMemo(
    () => splitPhone(sourceProfile.phone),
    [sourceProfile.phone],
  );

  const [form, setForm] = useState<ProfileFormState>({
    name: sourceProfile.name,
    email: sourceProfile.email,
    countryCode: sourcePhoneParts.countryCode,
    nationalNumber: sourcePhoneParts.nationalNumber,
    avatar: sourceProfile.avatar,
    avatarImageId: null,
  });

  useEffect(() => {
    const parts = splitPhone(sourceProfile.phone);
    setForm({
      name: sourceProfile.name,
      email: sourceProfile.email,
      countryCode: parts.countryCode,
      nationalNumber: parts.nationalNumber,
      avatar: sourceProfile.avatar,
      avatarImageId: null,
    });
  }, [sourceProfile]);

  const composedPhone = formPhone(form);
  const isDirty =
    form.name !== sourceProfile.name ||
    composedPhone !== (sourceProfile.phone || '') ||
    form.avatar !== sourceProfile.avatar;

  function resetFormFromSource() {
    const parts = splitPhone(sourceProfile.phone);
    setForm({
      name: sourceProfile.name,
      email: sourceProfile.email,
      countryCode: parts.countryCode,
      nationalNumber: parts.nationalNumber,
      avatar: sourceProfile.avatar,
      avatarImageId: null,
    });
  }

  function handleCancelEdit() {
    resetFormFromSource();
    setPickerOpen(false);
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isDirty || saveBusy) return;

    const trimmedName = form.name.trim();
    const phone = formPhone(form);

    if (!trimmedName) {
      showToast('Name is required.', 'error');
      return;
    }

    await runExclusive(async () => {
      try {
        await updateProfile({
          name: trimmedName,
          phone: phone || null,
          imageUrl: form.avatar,
        }).unwrap();

        updateUserProfile({
          name: trimmedName,
          phone,
          avatar: form.avatar,
        });
        showToast('Profile updated successfully.');
        setIsEditing(false);
        setPickerOpen(false);
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to update profile.'),
          'error',
        );
      }
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Your profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View your account details. Click edit to update your photo, name, or
          phone.
        </p>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative shrink-0">
              <UserAvatar
                name={form.name || sourceProfile.name}
                email={sourceProfile.email}
                avatar={form.avatar}
                size={64}
              />
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  disabled={saveBusy}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/55 disabled:opacity-50"
                  aria-label="Change profile photo"
                >
                  <Camera className="size-5" />
                </button>
              ) : null}
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {form.name || sourceProfile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {sourceProfile.email}
              </p>
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="mt-1 text-xs font-semibold text-accent hover:underline"
                >
                  Change photo
                </button>
              ) : null}
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
                  disabled={saveBusy}
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
              <div className="flex gap-2">
                <select
                  id="profile-country-code"
                  aria-label="Country code"
                  disabled={saveBusy}
                  value={form.countryCode}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      countryCode: event.target.value as CountryCode,
                    }))
                  }
                  className="w-[9.5rem] shrink-0 rounded-lg border border-border bg-background px-2.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <input
                  id="profile-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  disabled={saveBusy}
                  value={form.nationalNumber}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nationalNumber: event.target.value.replace(
                        /[^\d\s-]/g,
                        '',
                      ),
                    }))
                  }
                  placeholder="98765 43210"
                  className={inputClassName}
                />
              </div>
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
              disabled={saveBusy}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || saveBusy}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-black"
            >
              {saveBusy ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        ) : null}
      </form>

      <ProfileAvatarPicker
        open={pickerOpen}
        selectedImageId={form.avatarImageId}
        selectedAvatarUrl={form.avatar}
        onClose={() => setPickerOpen(false)}
        onSelect={(image, imageUrl) => {
          setForm((current) => ({
            ...current,
            avatar: imageUrl,
            avatarImageId: image.id,
          }));
          setPickerOpen(false);
        }}
      />
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
