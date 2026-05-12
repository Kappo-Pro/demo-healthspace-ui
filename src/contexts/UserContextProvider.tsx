/**
 * UserContextProvider
 * Story 2.1: User-specific context provider for command palette
 */

import React, { useLayoutEffect, PropsWithChildren } from 'react';
import { useCommandRegistry } from './CommandPaletteContext';
import type { UserContext } from '../lib/commands/types';
import { getUserCommands } from '../config/commands/userCommands';

/**
 * Props for UserContextProvider
 */
export interface UserContextProviderProps extends PropsWithChildren {
  /** User ID - Required, non-empty string */
  userId: string;
  /** User's display name */
  userName: string;
  /** User's role in the system */
  userRole: 'super-admin' | 'admin' | 'user';
}

/**
 * UserContextProvider - Activates user-specific commands when a user is selected
 *
 * Pushes UserContext onto the command registry stack and registers user-specific commands.
 * Automatically cleans up on unmount by popping context and unregistering commands.
 *
 * Note: Uses useLayoutEffect to ensure parent context is pushed before child contexts,
 * maintaining proper context stack order (global → user → program).
 *
 * @example
 * ```tsx
 * // In admin patient detail page
 * function PatientDetailPage() {
 *   const patient = usePatient();
 *
 *   return (
 *     <UserContextProvider
 *       userId={patient.id}
 *       userName={patient.name}
 *       userRole={patient.role}
 *     >
 *       <PatientDetailView />
 *     </UserContextProvider>
 *   );
 * }
 * ```
 *
 * Context Stack Example:
 * ```
 * Before mount: [GlobalContext]
 * After mount:  [GlobalContext, UserContext]
 * After unmount: [GlobalContext]
 * ```
 */
export const UserContextProvider: React.FC<UserContextProviderProps> = ({
  userId,
  userName,
  userRole,
  children
}) => {
  const registry = useCommandRegistry(); // Performance: Won't re-render when palette opens/closes

  // Manage user context lifecycle
  // Using useLayoutEffect for synchronous execution during commit phase
  useLayoutEffect(() => {
    // Create user context object
    const userContext: UserContext = {
      type: 'user',
      userId,
      userName,
      userRole
    };

    // Push context onto stack
    // Note: SEC-5 transition rules allow 'user' from 'program' to support
    // React effect ordering edge cases (child effects run before parent)
    registry.pushContext(userContext);

    // Register user-specific commands
    const userCommands = getUserCommands(userId, userName, userRole);
    registry.register(userCommands);

    // Cleanup on unmount or prop changes
    return () => {
      // Pop context from stack
      registry.popContext();

      // Unregister all user commands
      userCommands.forEach(cmd => registry.unregister(cmd.id));
    };
  }, [userId, userName, userRole, registry]);

  // Render children as fragment (no wrapper elements)
  return <>{children}</>;
};
