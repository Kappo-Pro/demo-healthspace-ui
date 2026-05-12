/**
 * useNavigationContext Hook
 *
 * Manages navigation context state including expanded sections,
 * recent history, and navigation preferences.
 *
 * @see Phase 2: Progressive Disclosure System
 */

import { useState, useEffect, useCallback } from 'react';
import { NavigationItem } from '@components/layouts/AppLayout/types';

const MAX_RECENT_ITEMS = 5;
const STORAGE_KEY_EXPANDED = 'nav-expanded-sections';
const STORAGE_KEY_RECENT = 'nav-recent-items';

export interface NavigationContextState {
  /** IDs of currently expanded sections */
  expandedSections: Set<string>;

  /** Recently visited navigation items */
  recentItems: NavigationItem[];

  /** Expand a section */
  expandSection: (sectionId: string) => void;

  /** Collapse a section */
  collapseSection: (sectionId: string) => void;

  /** Toggle section expansion */
  toggleSection: (sectionId: string) => void;

  /** Check if section is expanded */
  isExpanded: (sectionId: string) => boolean;

  /** Add item to recent history */
  addToRecent: (item: NavigationItem) => void;

  /** Clear recent history */
  clearRecent: () => void;
}

/**
 * Hook to manage navigation context state
 *
 * Handles:
 * - Section expansion/collapse with localStorage persistence
 * - Recently visited items tracking
 * - Navigation preferences
 *
 * @returns Navigation context state and handlers
 *
 * @example
 * ```tsx
 * const { expandedSections, toggleSection, addToRecent } = useNavigationContext();
 *
 * <NavItem
 *   onClick={() => {
 *     toggleSection(item.id);
 *     addToRecent(item);
 *   }}
 * />
 * ```
 */
export function useNavigationContext(): NavigationContextState {
  // Initialize expanded sections from localStorage
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();

    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXPANDED);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Initialize recent items from localStorage
  const [recentItems, setRecentItems] = useState<NavigationItem[]>(() => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECENT);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist expanded sections to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        STORAGE_KEY_EXPANDED,
        JSON.stringify(Array.from(expandedSections))
      );
    } catch (error) {
      // localStorage quota exceeded or access denied - fail silently
      console.error('[useNavigationContext] Failed to persist expanded sections:', error);
    }
  }, [expandedSections]);

  // Persist recent items to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentItems));
    } catch (error) {
      // localStorage quota exceeded or access denied - fail silently
      console.error('[useNavigationContext] Failed to persist recent items:', error);
    }
  }, [recentItems]);

  const expandSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => new Set(prev).add(sectionId));
  }, []);

  const collapseSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.delete(sectionId);
      return next;
    });
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (sectionId: string) => {
      return expandedSections.has(sectionId);
    },
    [expandedSections]
  );

  const addToRecent = useCallback((item: NavigationItem) => {
    // Only add items with paths
    if (!item.path) return;

    setRecentItems(prev => {
      // Remove if already exists
      const filtered = prev.filter(i => i.id !== item.id);

      // Add to front
      const next = [item, ...filtered];

      // Limit to MAX_RECENT_ITEMS
      return next.slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentItems([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_RECENT);
      } catch (error) {
        // localStorage access denied - fail silently
        console.error('[useNavigationContext] Failed to clear recent items:', error);
      }
    }
  }, []);

  return {
    expandedSections,
    recentItems,
    expandSection,
    collapseSection,
    toggleSection,
    isExpanded,
    addToRecent,
    clearRecent,
  };
}
