'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import CareerApiErrorState from '@/components/career/CareerApiErrorState';
import CareerModuleShell from '@/components/career/CareerModuleShell';
import {
  EMPLOYMENT_OPTIONS,
  LOCATION_OPTIONS,
  PREFERRED_ROLE_OPTIONS,
  WORK_MODE_OPTIONS,
} from '@/lib/career/constants';
import { useCareerPreferences } from '@/hooks/useCareerPreferences';

export default function CareerPreferencesPage() {
  const {
    preferences,
    isLoading,
    isError,
    isSaving,
    refetch,
    save,
    toggleRole,
    toggleLocation,
    toggleEmployment,
    toggleWorkMode,
    setSalary,
    setCompanies,
    setAutoApply,
  } = useCareerPreferences();

  const [preferredInput, setPreferredInput] = useState('');
  const [blockedInput, setBlockedInput] = useState('');

  if (isLoading) {
    return (
      <CareerModuleShell activeNav="preferences">
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </CareerModuleShell>
    );
  }

  if (isError) {
    return (
      <CareerModuleShell activeNav="preferences">
        <CareerApiErrorState
          title="Could not load preferences"
          message="Job preferences could not be loaded. Retry when your connection is available."
          onRetry={() => void refetch()}
        />
      </CareerModuleShell>
    );
  }

  function addCompany(
    kind: 'preferred' | 'blocked',
    value: string,
    clear: () => void,
  ) {
    const next = value.trim();
    if (!next) return;

    if (kind === 'preferred') {
      if (preferences.preferredCompanies.includes(next)) return;
      setCompanies(
        [...preferences.preferredCompanies, next],
        preferences.blockedCompanies,
      );
    } else {
      if (preferences.blockedCompanies.includes(next)) return;
      setCompanies(preferences.preferredCompanies, [
        ...preferences.blockedCompanies,
        next,
      ]);
    }
    clear();
  }

  return (
    <CareerModuleShell activeNav="preferences">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Preferences
            </p>
            <h1 className="mt-2 text-2xl font-bold text-foreground">
              Job preferences
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Tell us what roles, locations, and companies you want — and which
              to skip.
            </p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:opacity-60 dark:text-black"
          >
            {isSaving ? 'Saving…' : 'Save preferences'}
          </button>
        </header>

        <PreferenceCard title="Preferred Roles">
          <ChipGrid>
            {PREFERRED_ROLE_OPTIONS.map((role) => (
              <SelectableChip
                key={role}
                label={role}
                selected={preferences.preferredRoles.includes(role)}
                onClick={() => toggleRole(role)}
              />
            ))}
          </ChipGrid>
        </PreferenceCard>

        <PreferenceCard title="Location">
          <ChipGrid>
            {LOCATION_OPTIONS.map((location) => (
              <SelectableChip
                key={location}
                label={location}
                selected={preferences.preferredLocations.includes(location)}
                onClick={() => toggleLocation(location)}
              />
            ))}
          </ChipGrid>
        </PreferenceCard>

        <PreferenceCard title="Salary">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Minimum"
              value={preferences.minSalary ?? ''}
              onChange={(value) =>
                setSalary(
                  value === '' ? null : Number(value),
                  preferences.maxSalary,
                )
              }
            />
            <NumberField
              label="Maximum"
              value={preferences.maxSalary ?? ''}
              onChange={(value) =>
                setSalary(
                  preferences.minSalary,
                  value === '' ? null : Number(value),
                )
              }
            />
          </div>
        </PreferenceCard>

        <PreferenceCard title="Employment">
          <div className="space-y-4">
            <ChipGrid>
              {EMPLOYMENT_OPTIONS.map((option) => (
                <SelectableChip
                  key={option.value}
                  label={option.label}
                  selected={preferences.employmentTypes.includes(option.value)}
                  onClick={() => toggleEmployment(option.value)}
                />
              ))}
            </ChipGrid>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Work mode
              </p>
              <ChipGrid>
                {WORK_MODE_OPTIONS.map((option) => (
                  <SelectableChip
                    key={option.value}
                    label={option.label}
                    selected={preferences.workModes.includes(option.value)}
                    onClick={() => toggleWorkMode(option.value)}
                  />
                ))}
              </ChipGrid>
            </div>
          </div>
        </PreferenceCard>

        <PreferenceCard title="Companies">
          <div className="grid gap-6 lg:grid-cols-2">
            <CompanyList
              title="Preferred"
              companies={preferences.preferredCompanies}
              input={preferredInput}
              onInputChange={setPreferredInput}
              onAdd={() =>
                addCompany('preferred', preferredInput, () =>
                  setPreferredInput(''),
                )
              }
              onRemove={(company) =>
                setCompanies(
                  preferences.preferredCompanies.filter(
                    (item) => item !== company,
                  ),
                  preferences.blockedCompanies,
                )
              }
            />
            <CompanyList
              title="Blocked"
              companies={preferences.blockedCompanies}
              input={blockedInput}
              onInputChange={setBlockedInput}
              onAdd={() =>
                addCompany('blocked', blockedInput, () => setBlockedInput(''))
              }
              onRemove={(company) =>
                setCompanies(
                  preferences.preferredCompanies,
                  preferences.blockedCompanies.filter(
                    (item) => item !== company,
                  ),
                )
              }
            />
          </div>
        </PreferenceCard>

        <PreferenceCard title="Auto Apply">
          <ChipGrid>
            <SelectableChip
              label="Enable"
              selected={preferences.autoApply}
              onClick={() => setAutoApply(true)}
            />
            <SelectableChip
              label="Disable"
              selected={!preferences.autoApply}
              onClick={() => setAutoApply(false)}
            />
          </ChipGrid>
        </PreferenceCard>
      </div>
    </CareerModuleShell>
  );
}

function PreferenceCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function SelectableChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
        selected
          ? 'border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_var(--neon-glow)]'
          : 'border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground'
      }`}
    >
      {selected ? <Check className="size-3.5" /> : null}
      {label}
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | '';
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        placeholder="LPA"
      />
    </label>
  );
}

function CompanyList({
  title,
  companies,
  input,
  onInputChange,
  onAdd,
  onRemove,
}: {
  title: string;
  companies: string[];
  input: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (company: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder="Company name"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {companies.length === 0 ? (
          <p className="text-xs text-muted-foreground">None added yet</p>
        ) : (
          companies.map((company) => (
            <button
              key={company}
              type="button"
              onClick={() => onRemove(company)}
              className="rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground hover:border-red-500/40 hover:text-red-500"
              title="Remove"
            >
              {company} ×
            </button>
          ))
        )}
      </div>
    </div>
  );
}
