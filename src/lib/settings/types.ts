export type ModuleViewMode = 'desktop' | 'mobile';

export type PortalModuleId = 'dashboard' | 'coding-challenges';

export type SidebarNavItemConfig = {
  id: string;
  moduleId: PortalModuleId;
  label: string;
  href: string;
  description: string;
  visible: boolean;
};

export type ModuleSettings = {
  id: PortalModuleId;
  name: string;
  description: string;
  enabled: boolean;
  viewMode: ModuleViewMode;
};

export type UserProfileDetail = {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
};

export type PortalSettings = {
  sidebarNav: SidebarNavItemConfig[];
  modules: ModuleSettings[];
};

export type SettingsSectionId = 'profile' | 'sidebar' | 'modules';
