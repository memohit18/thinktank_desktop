'use client';

import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useSettings } from '@/providers/SettingsProvider';

export default function SidebarNavSettingsSection() {
  const { settings, setSidebarNavVisible } = useSettings();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Sidebar navigation
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which modules appear in the left sidebar. Disabled modules are
          hidden from navigation immediately.
        </p>
      </div>

      <div className="space-y-3">
        {settings.sidebarNav.map((item) => {
          const module = settings.modules.find(
            (entry) => entry.id === item.moduleId,
          );
          const moduleDisabled = module ? !module.enabled : false;

          return (
            <div
              key={item.id}
              className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {item.href}
                </p>
                {moduleDisabled ? (
                  <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                    Module is disabled — enable it under Modules to show this
                    link.
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                <span className="text-xs font-medium text-muted-foreground sm:sr-only">
                  {item.visible ? 'Visible' : 'Hidden'}
                </span>
                <ToggleSwitch
                  checked={item.visible}
                  disabled={moduleDisabled}
                  label={`Show ${item.label} in sidebar`}
                  onChange={(visible) => setSidebarNavVisible(item.id, visible)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
