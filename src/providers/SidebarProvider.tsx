'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const SIDEBAR_PINNED_KEY = 'thinktank-sidebar-pinned';

type SidebarContextValue = {
  pinned: boolean;
  togglePinned: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    setPinned(localStorage.getItem(SIDEBAR_PINNED_KEY) === 'true');
  }, []);

  const togglePinned = useCallback(() => {
    setPinned((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_PINNED_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ pinned, togglePinned }),
    [pinned, togglePinned],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }

  return context;
}

export default SidebarProvider;
