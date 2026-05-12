import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';

/**
 * Custom hook for managing collapsible section state with localStorage persistence
 *
 * EPIC-013-S1: Specialized hook for dashboard collapsible sections
 *
 * This hook provides a simple API for managing expanded/collapsed state while
 * automatically persisting to localStorage. Built on top of usePersistedState.
 *
 * @example
 * ```typescript
 * const [isExpanded, toggleExpanded] = useCollapsibleState({
 *   sectionId: 'my-programs',
 *   defaultExpanded: true
 * });
 *
 * return (
 *   <div>
 *     <button onClick={toggleExpanded}>Toggle</button>
 *     {isExpanded && <div>Content</div>}
 *   </div>
 * );
 * ```
 *
 * @param options - Configuration options
 * @param options.sectionId - Unique identifier for the section (stable, no Math.random())
 * @param options.defaultExpanded - Default state when no saved state exists (default: true)
 * @returns Tuple of [isExpanded, toggleExpanded]
 *
 * @security Safe for non-PHI data (UI preferences only)
 * @performance State persists across page reloads and remounts
 */
export interface UseCollapsibleStateOptions {
  /** Unique, stable identifier for the section (e.g., 'my-programs', 'recent-activity') */
  sectionId: string;
  /** Default expanded state when no saved state exists */
  defaultExpanded?: boolean;
}

export type UseCollapsibleStateReturn = [
  /** Whether the section is currently expanded */
  isExpanded: boolean,
  /** Toggle function to expand/collapse the section */
  toggleExpanded: () => void
];

export const useCollapsibleState = ({
  sectionId,
  defaultExpanded = true,
}: UseCollapsibleStateOptions): UseCollapsibleStateReturn => {
  // Generate storage key following dashboard naming convention
  const storageKey = `dashboard-section-state-${sectionId}`;

  // Use generic persisted state hook with boolean type
  const [isExpanded, setIsExpanded] = usePersistedState<boolean>(
    storageKey,
    defaultExpanded
  );

  // Memoized toggle function for stable reference
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, [setIsExpanded]);

  return [isExpanded, toggleExpanded];
};

export default useCollapsibleState;
