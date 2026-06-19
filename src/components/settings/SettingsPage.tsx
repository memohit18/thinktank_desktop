'use client';

import type { SettingsSectionId } from '@/lib/settings/types';
import ModuleSettingsSection from '@/components/settings/ModuleSettingsSection';
import ProfileSettingsSection from '@/components/settings/ProfileSettingsSection';
import SidebarNavSettingsSection from '@/components/settings/SidebarNavSettingsSection';
import { useSettings } from '@/providers/SettingsProvider';

const SECTIONS: { id: SettingsSectionId; label: string; hint: string }[] = [
  { id: 'profile', label: 'Profile', hint: 'Edit your account details' },
  { id: 'sidebar', label: 'Sidebar', hint: 'Show or hide nav links' },
  { id: 'modules', label: 'Modules', hint: 'Enable and set view mode' },
];

export default function SettingsPage() {
  const { activeSection, setActiveSection } = useSettings();

  return (
    <main className="flex-1 p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Portal configuration
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Control your profile, sidebar navigation, and module visibility.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
        Preview mode: changes apply to this session only. Persist settings via
        your API when you wire it up.
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="space-y-1 rounded-2xl border border-border bg-card p-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-accent/10 text-accent'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <p className="text-sm font-semibold">{section.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {section.hint}
              </p>
            </button>
          ))}
        </nav>

        <div>
          {activeSection === 'profile' ? <ProfileSettingsSection /> : null}
          {activeSection === 'sidebar' ? <SidebarNavSettingsSection /> : null}
          {activeSection === 'modules' ? <ModuleSettingsSection /> : null}
        </div>
      </div>
    </main>
  );
}
