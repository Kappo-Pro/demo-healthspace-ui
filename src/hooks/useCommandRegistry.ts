/**
 * useCommandRegistry Hook
 * Story 2.5: Custom hook to access the command registry instance
 *
 * PERFORMANCE NOTE (2025-11-18):
 * This hook now uses the optimized useCommandRegistry from CommandPaletteContext,
 * which won't cause re-renders when the palette's isOpen state changes.
 */

import { useCommandRegistry as useCommandRegistryContext } from '@contexts/CommandPaletteContext';
import { CommandRegistry } from '@lib/commands/CommandRegistry';

/**
 * Hook to access the command registry (performance optimized).
 * Must be used within CommandPaletteProvider.
 *
 * PERFORMANCE: This hook won't re-render when the command palette opens/closes,
 * only when the registry itself changes (which is rare).
 *
 * @returns The command registry instance
 * @throws Error if used outside CommandPaletteProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const registry = useCommandRegistry(); // Won't re-render when palette opens/closes
 *   const commands = registry.getCommands({ contexts: ['user'] });
 *   // ...
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Query commands
 * const registry = useCommandRegistry();
 * const searchResults = registry.getCommands({ query: 'search term' });
 * ```
 *
 * @example
 * ```tsx
 * // Check context stack
 * const registry = useCommandRegistry();
 * const contextStack = registry.getContextStack();
 *  * ```
 */
export const useCommandRegistry = (): CommandRegistry => {
  return useCommandRegistryContext();
};
