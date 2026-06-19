'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_PORTAL_SETTINGS, DEFAULT_USER_PROFILE } from '@/lib/settings/defaults';
import type {
  ModuleSettings,
  ModuleViewMode,
  PortalModuleId,
  PortalSettings,
  SettingsSectionId,
  UserProfileDetail,
} from '@/lib/settings/types';

type SettingsContextValue = {
  settings: PortalSettings;
  userProfile: UserProfileDetail;
  activeSection: SettingsSectionId;
  setActiveSection: (section: SettingsSectionId) => void;
  visibleNavItems: PortalSettings['sidebarNav'];
  isModuleEnabled: (moduleId: PortalModuleId) => boolean;
  getModuleViewMode: (moduleId: PortalModuleId) => ModuleViewMode;
  setSidebarNavVisible: (navId: string, visible: boolean) => void;
  setModuleEnabled: (moduleId: PortalModuleId, enabled: boolean) => void;
  setModuleViewMode: (moduleId: PortalModuleId, viewMode: ModuleViewMode) => void;
  updateUserProfile: (patch: Partial<UserProfileDetail>) => void;
  resetUserProfile: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PortalSettings>(
    DEFAULT_PORTAL_SETTINGS,
  );
  const [userProfile, setUserProfile] = useState<UserProfileDetail>(
    DEFAULT_USER_PROFILE,
  );
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>('profile');

  const visibleNavItems = useMemo(
    () =>
      settings.sidebarNav.filter((item) => {
        const module = settings.modules.find(
          (entry) => entry.id === item.moduleId,
        );
        return item.visible && (module?.enabled ?? true);
      }),
    [settings],
  );

  const isModuleEnabled = useCallback(
    (moduleId: PortalModuleId) =>
      settings.modules.find((module) => module.id === moduleId)?.enabled ??
      false,
    [settings.modules],
  );

  const getModuleViewMode = useCallback(
    (moduleId: PortalModuleId): ModuleViewMode =>
      settings.modules.find((module) => module.id === moduleId)?.viewMode ??
      'desktop',
    [settings.modules],
  );

  const setSidebarNavVisible = useCallback((navId: string, visible: boolean) => {
    setSettings((current) => ({
      ...current,
      sidebarNav: current.sidebarNav.map((item) =>
        item.id === navId ? { ...item, visible } : item,
      ),
    }));
  }, []);

  const setModuleEnabled = useCallback(
    (moduleId: PortalModuleId, enabled: boolean) => {
      setSettings((current) => ({
        ...current,
        modules: current.modules.map((module) =>
          module.id === moduleId ? { ...module, enabled } : module,
        ),
        sidebarNav: current.sidebarNav.map((item) =>
          item.moduleId === moduleId && !enabled
            ? { ...item, visible: false }
            : item,
        ),
      }));
    },
    [],
  );

  const setModuleViewMode = useCallback(
    (moduleId: PortalModuleId, viewMode: ModuleViewMode) => {
      setSettings((current) => ({
        ...current,
        modules: current.modules.map((module) =>
          module.id === moduleId ? { ...module, viewMode } : module,
        ),
      }));
    },
    [],
  );

  const updateUserProfile = useCallback((patch: Partial<UserProfileDetail>) => {
    setUserProfile((current) => ({ ...current, ...patch }));
  }, []);

  const resetUserProfile = useCallback(() => {
    setUserProfile(DEFAULT_USER_PROFILE);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      userProfile,
      activeSection,
      setActiveSection,
      visibleNavItems,
      isModuleEnabled,
      getModuleViewMode,
      setSidebarNavVisible,
      setModuleEnabled,
      setModuleViewMode,
      updateUserProfile,
      resetUserProfile,
    }),
    [
      settings,
      userProfile,
      activeSection,
      visibleNavItems,
      isModuleEnabled,
      getModuleViewMode,
      setSidebarNavVisible,
      setModuleEnabled,
      setModuleViewMode,
      updateUserProfile,
      resetUserProfile,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
}

export default SettingsProvider;
