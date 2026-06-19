'use client';

import type { ModuleViewMode } from '@/lib/settings/types';
import SegmentedControl from '@/components/ui/SegmentedControl';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useSettings } from '@/providers/SettingsProvider';

const VIEW_MODE_OPTIONS: {
  value: ModuleViewMode;
  label: string;
  hint: string;
}[] = [
  {
    value: 'desktop',
    label: 'Desktop',
    hint: 'Wide layout with full table columns',
  },
  {
    value: 'mobile',
    label: 'Mobile',
    hint: 'Compact cards and stacked controls',
  },
];

export default function ModuleSettingsSection() {
  const { settings, setModuleEnabled, setModuleViewMode } = useSettings();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Modules</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enable modules for your organization and pick how each one should
          render — desktop layout or mobile layout.
        </p>
      </div>

      <div className="space-y-3">
        {settings.modules.map((module) => (
          <div
            key={module.id}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{module.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>

              <ToggleSwitch
                checked={module.enabled}
                label={`Enable ${module.name}`}
                onChange={(enabled) => setModuleEnabled(module.id, enabled)}
              />
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                View mode
              </p>
              <div className="mt-3">
                <SegmentedControl
                  layout="cards"
                  value={module.viewMode}
                  disabled={!module.enabled}
                  options={VIEW_MODE_OPTIONS}
                  onChange={(viewMode) => setModuleViewMode(module.id, viewMode)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
