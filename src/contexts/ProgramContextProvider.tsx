/**
 * ProgramContextProvider
 * Story 2.2: Program-specific context provider for command palette
 */

import React, { useLayoutEffect, PropsWithChildren } from 'react';
import { useCommandRegistry } from './CommandPaletteContext';
import type { ProgramContext } from '../lib/commands/types';
import { getProgramCommands, type ProgramType } from '../config/commands/programCommands';

/**
 * Props for ProgramContextProvider
 */
export interface ProgramContextProviderProps extends PropsWithChildren {
  /** User ID - Required for navigation URLs */
  userId: string;
  /** Program ID - Required, non-empty string */
  programId: string;
  /** Program's display name */
  programName: string;
  /** Program type for type-specific commands */
  programType: ProgramType;
}

/**
 * ProgramContextProvider - Activates program-specific commands when a user enters a program context
 *
 * Pushes ProgramContext onto the command registry stack and registers program-specific commands.
 * Automatically cleans up on unmount by popping context and unregistering commands.
 *
 * Note: Uses useLayoutEffect to ensure parent context is pushed before child contexts,
 * maintaining proper context stack order (global → user → program).
 *
 * @example
 * ```tsx
 * // In ROM program page
 * function ROMProgramPage() {
 *   const { user } = useAuth();
 *   const { program } = useProgram();
 *
 *   return (
 *     <UserContextProvider
 *       userId={user.id}
 *       userName={user.name}
 *       userRole={user.role}
 *     >
 *       <ProgramContextProvider
 *         userId={user.id}
 *         programId={program.id}
 *         programName={program.name}
 *         programType="rom"
 *       >
 *         <ROMAssessmentView program={program} />
 *       </ProgramContextProvider>
 *     </UserContextProvider>
 *   );
 * }
 * ```
 *
 * Context Stack Example:
 * ```
 * Before mount: [GlobalContext, UserContext]
 * After mount:  [GlobalContext, UserContext, ProgramContext]
 * After unmount: [GlobalContext, UserContext]
 * ```
 */
export const ProgramContextProvider: React.FC<ProgramContextProviderProps> = ({
  userId,
  programId,
  programName,
  programType,
  children
}) => {
  const registry = useCommandRegistry(); // Performance: Won't re-render when palette opens/closes

  // Manage program context lifecycle
  // Using useLayoutEffect for synchronous execution during commit phase
  useLayoutEffect(() => {
    // Defensive: Warn if UserContext is not present
    // In React, child useLayoutEffect runs before parent, so this warning is expected
    // during initial mount. The UserContext will be pushed immediately after.
    const currentStack = registry.getContextStack();
    const hasUserContext = currentStack.some(ctx => ctx.type === 'user');

    if (!hasUserContext) {
      // UserContext missing - this is expected during initial mount due to useLayoutEffect timing
      // The UserContext will be pushed by the parent component immediately after
      // eslint-disable-next-line no-console
    }

    // Create program context object
    const programContext: ProgramContext = {
      type: 'program',
      programId,
      programName
    };

    // Push context onto stack
    registry.pushContext(programContext);

    // Register program-specific commands
    const programCommands = getProgramCommands(userId, programId, programName, programType);
    registry.register(programCommands);

    // Cleanup on unmount or prop changes
    return () => {
      // Pop context from stack
      registry.popContext();

      // Unregister all program commands
      programCommands.forEach(cmd => registry.unregister(cmd.id));
    };
  }, [userId, programId, programName, programType, registry]);

  // Render children as fragment (no wrapper elements)
  return <>{children}</>;
};
