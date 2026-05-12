/**
 * Command Palette Hooks
 * Story 2.5: Barrel export for command palette custom hooks
 *
 * Custom React hooks for interacting with the command palette system.
 * These hooks provide declarative and ergonomic APIs for:
 * - Accessing the command registry
 * - Registering/unregistering commands
 * - Executing commands with error handling
 * - Performance optimizations (debouncing)
 */

export { useCommandRegistry } from './useCommandRegistry';
export { useRegisterCommands } from './useRegisterCommands';
export { useExecuteCommand } from './useExecuteCommand';

/**
 * Performance Optimization Hooks
 * Story 3.3: Debouncing utilities for search and filter inputs
 * EPIC-006-S2: Debouncing utilities for action buttons
 */
export { useDebouncedValue } from './useDebouncedValue';
export { useDebounce } from './useDebounce';

/**
 * Dashboard State Management Hooks
 * EPIC-013-S1: Collapsible section state with localStorage persistence
 * EPIC-016-S1: Dismissed alerts management with time-based re-showing
 */
export { useCollapsibleState } from './useCollapsibleState';
export { useDismissedAlerts } from './useDismissedAlerts';

/**
 * Feature Flag Hooks - REMOVED
 * EPIC-024-S4: Feature flag system removed in feature-flag-removal epic
 * Former exports: useFeatureFlag, useFeatureFlags, isVariant
 * Removed: 2025-11-07
 */

/**
 * Translation Hooks
 * TRANSLATION-001-S1: Type-safe i18n translation hook
 */
export { useTypedTranslation } from './useTypedTranslation';
export { default as useTypedTranslation_default } from './useTypedTranslation';

/**
 * Search Hooks
 * Shared fuzzy search utilities for CommandPalette and UserDetailsModal
 */
export { useFuzzySearch, fuzzyMatch, fuzzyFilter } from './useFuzzySearch';
