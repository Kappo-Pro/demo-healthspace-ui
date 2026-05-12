/**
 * useActiveNavigation Hook
 *
 * Determines the active navigation item based on the current URL path.
 * Supports multi-level navigation hierarchy (primary, secondary, tertiary).
 *
 * @see Phase 2: Active State Management
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationItem } from '@components/layouts/AppLayout/types';

export interface ActiveNavigationState {
  /** Primary navigation item ID */
  primary: string | null;

  /** Secondary navigation item ID */
  secondary: string | null;

  /** Tertiary navigation item ID (if nested 3 levels deep) */
  tertiary: string | null;

  /** Full active item object */
  activeItem: NavigationItem | null;

  /** Active item path */
  activePath: string | null;
}

/**
 * Find the active navigation item by matching the current path
 *
 * @param items - Navigation items to search
 * @param currentPath - Current URL path
 * @param parentId - Parent item ID (for recursive search)
 * @returns Active navigation state or null
 */
function findActiveItem(
  items: NavigationItem[],
  currentPath: string,
  parentId: string | null = null
): ActiveNavigationState | null {
  for (const item of items) {
    // Direct path match
    if (item.path && currentPath === item.path) {
      return {
        primary: parentId || item.id,
        secondary: parentId ? item.id : null,
        tertiary: null,
        activeItem: item,
        activePath: item.path,
      };
    }

    // Partial path match (for nested routes)
    if (item.path && currentPath.startsWith(item.path)) {
      // Check children first for more specific match
      if (item.children && item.children.length > 0) {
        const childMatch = findActiveItem(
          item.children,
          currentPath,
          parentId || item.id
        );
        if (childMatch) {
          return childMatch;
        }
      }

      // If no child matches, this item is active
      return {
        primary: parentId || item.id,
        secondary: parentId ? item.id : null,
        tertiary: null,
        activeItem: item,
        activePath: item.path,
      };
    }

    // Recursively check children
    if (item.children && item.children.length > 0) {
      const childMatch = findActiveItem(
        item.children,
        currentPath,
        parentId || item.id
      );
      if (childMatch) {
        return childMatch;
      }
    }
  }

  return null;
}

/**
 * Hook to determine active navigation state based on current URL
 *
 * @param navigationItems - Navigation items configuration
 * @returns Active navigation state
 *
 * @example
 * ```tsx
 * const { primary, secondary, activeItem } = useActiveNavigation(navItems);
 *
 * // Use in navigation component
 * <NavItem isActive={item.id === primary} />
 * ```
 */
export function useActiveNavigation(
  navigationItems: NavigationItem[]
): ActiveNavigationState {
  const location = useLocation();
  const [activeState, setActiveState] = useState<ActiveNavigationState>({
    primary: null,
    secondary: null,
    tertiary: null,
    activeItem: null,
    activePath: null,
  });

  // Memoize the active item search
  const computedActiveState = useMemo(() => {
    const found = findActiveItem(navigationItems, location.pathname);
    return (
      found || {
        primary: null,
        secondary: null,
        tertiary: null,
        activeItem: null,
        activePath: null,
      }
    );
  }, [navigationItems, location.pathname]);

  useEffect(() => {
    setActiveState(computedActiveState);
  }, [computedActiveState]);

  return activeState;
}

/**
 * Check if a navigation item or its children are active
 *
 * @param item - Navigation item to check
 * @param currentPath - Current URL path
 * @returns True if item or any child is active
 */
export function isItemActive(
  item: NavigationItem,
  currentPath: string
): boolean {
  // Direct match
  if (item.path === currentPath) {
    return true;
  }

  // Partial match (current path starts with item path)
  if (item.path && currentPath.startsWith(item.path)) {
    return true;
  }

  // Check children
  if (item.children && item.children.length > 0) {
    return item.children.some(child => isItemActive(child, currentPath));
  }

  return false;
}

/**
 * Check if a navigation item has an active child
 *
 * @param item - Navigation item to check
 * @param currentPath - Current URL path
 * @returns True if any child is active
 */
export function hasActiveChild(
  item: NavigationItem,
  currentPath: string
): boolean {
  if (!item.children || item.children.length === 0) {
    return false;
  }

  return item.children.some(child => isItemActive(child, currentPath));
}
