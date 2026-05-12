/**
 * useRegisterCommands Hook
 * Story 2.5: Custom hook to declaratively register commands
 */

import { useEffect } from 'react';
import { useCommandRegistry } from './useCommandRegistry';
import { Command } from '@lib/commands/types';

/**
 * Hook to declaratively register commands.
 * Automatically unregisters commands on unmount or when commands array changes.
 *
 * @param commands - Array of commands to register
 *
 * @example
 * ```tsx
 * function FeatureComponent() {
 *   const myCommands = useMemo(() => [
 *     {
 *       id: 'feature-action-1',
 *       label: 'Feature Action 1',
 *       category: 'action',
 *       availableInContexts: ['global'],
 *       handler: async () => {
 *         // Command logic here
 *       }
 *     }
 *   ], []);
 *
 *   useRegisterCommands(myCommands);
 *
 *   return <div>Feature UI</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Register conditional commands
 * function ConditionalComponent({ isEnabled }) {
 *   const commands = useMemo(() => {
 *     if (!isEnabled) return [];
 *
 *     return [
 *       { id: 'enabled-cmd', label: 'Enabled Command', ... }
 *     ];
 *   }, [isEnabled]);
 *
 *   useRegisterCommands(commands);
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Register commands with dynamic data
 * function UserCommands({ userId, userName }) {
 *   const commands = useMemo(() => [
 *     {
 *       id: `user-profile-${userId}`,
 *       label: `View ${userName}'s Profile`,
 *       category: 'navigation',
 *       availableInContexts: ['user'],
 *       handler: async () => {
 *         navigate(`/users/${userId}`);
 *       }
 *     }
 *   ], [userId, userName]);
 *
 *   useRegisterCommands(commands);
 *
 *   return null;
 * }
 * ```
 */
export const useRegisterCommands = (commands: Command[]): void => {
  const registry = useCommandRegistry();

  useEffect(() => {
    // Register commands on mount or when commands change
    registry.register(commands);

    // Cleanup: unregister commands on unmount or before re-registration
    return () => {
      commands.forEach(cmd => registry.unregister(cmd.id));
    };
  }, [registry, commands]);
};
