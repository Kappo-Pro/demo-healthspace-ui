/**
 * useSidebarState Hook
 *
 * Manages sidebar collapsed/open state with localStorage persistence.
 * Handles both desktop collapsed state and mobile drawer state.
 */

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../components/layouts/AppLayout/constants';
import { useBreakpoint } from './useBreakpoint';

interface UseSidebarStateProps {
  /** Initial collapsed state */
  defaultCollapsed?: boolean;

  /** Controlled collapsed state */
  collapsed?: boolean;

  /** Collapse change callback */
  onCollapse?: (collapsed: boolean) => void;
}

interface UseSidebarStateReturn {
  /** Desktop: sidebar collapsed state */
  collapsed: boolean;

  /** Mobile: drawer open state */
  mobileOpen: boolean;

  /** Toggle collapsed state (desktop) */
  toggle: () => void;

  /** Toggle collapsed state (desktop) - alias for compatibility */
  toggleCollapsed: () => void;

  /** Set collapsed state (desktop) */
  setCollapsed: (collapsed: boolean) => void;

  /** Open mobile drawer */
  openMobile: () => void;

  /** Open mobile drawer - alias for compatibility */
  openMobileDrawer: () => void;

  /** Close mobile drawer */
  closeMobile: () => void;

  /** Close mobile drawer - alias for compatibility */
  closeMobileDrawer: () => void;

  /** Toggle mobile drawer */
  toggleMobile: () => void;

  /** Toggle mobile drawer - alias for compatibility */
  toggleMobileDrawer: () => void;

  /** Is mobile viewport */
  isMobile: boolean;
}

/**
 * Load collapsed state from localStorage
 */
function loadCollapsedState(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return stored === 'true';
  } catch (error) {
    // localStorage access denied - return default
    console.error('[useSidebarState] Failed to load collapsed state:', error);
    return false;
  }
}

/**
 * Save collapsed state to localStorage
 */
function saveCollapsedState(collapsed: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
  } catch (error) {
    // localStorage access denied - fail silently
    console.error('[useSidebarState] Failed to save collapsed state:', error);
  }
}

/**
 * useSidebarState hook
 */
export function useSidebarState({
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapse,
}: UseSidebarStateProps = {}): UseSidebarStateReturn {
  const { isMobile } = useBreakpoint();

  // Initialize from localStorage or default
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (controlledCollapsed !== undefined) return controlledCollapsed;
    if (typeof window === 'undefined') return defaultCollapsed;
    return loadCollapsedState() || defaultCollapsed;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine if we're in controlled mode
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  // Update internal state when controlled value changes
  useEffect(() => {
    if (isControlled && controlledCollapsed !== undefined) {
      setInternalCollapsed(controlledCollapsed);
    }
  }, [isControlled, controlledCollapsed]);

  // Save to localStorage when state changes (only for uncontrolled mode)
  useEffect(() => {
    if (!isControlled) {
      saveCollapsedState(internalCollapsed);
    }
  }, [internalCollapsed, isControlled]);

  // Close mobile drawer when switching to desktop
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

  const setCollapsed = useCallback(
    (newCollapsed: boolean) => {
      if (isControlled) {
        onCollapse?.(newCollapsed);
      } else {
        setInternalCollapsed(newCollapsed);
        onCollapse?.(newCollapsed);
      }
    },
    [isControlled, onCollapse]
  );

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const openMobile = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  return {
    collapsed,
    mobileOpen,
    toggle,
    toggleCollapsed: toggle,
    setCollapsed,
    openMobile,
    openMobileDrawer: openMobile,
    closeMobile,
    closeMobileDrawer: closeMobile,
    toggleMobile,
    toggleMobileDrawer: toggleMobile,
    isMobile,
  };
}
