/**
 * TeamContextProvider
 * Story 2.4: Team-specific context provider for command palette
 */

import React, { useLayoutEffect, PropsWithChildren } from 'react';
import { useCommandRegistry } from './CommandPaletteContext';
import type { TeamContext } from '../lib/commands/types';
import { getTeamCommands } from '../config/commands/teamCommands';

/**
 * Props for TeamContextProvider
 */
export interface TeamContextProviderProps extends PropsWithChildren {
  /** Team ID - Required, non-empty string */
  teamId: string;
  /** Team's display name */
  teamName: string;
}

/**
 * TeamContextProvider - Activates team-specific commands when a user views a team context
 *
 * Pushes TeamContext onto the command registry stack and registers team-specific commands.
 * Automatically cleans up on unmount by popping context and unregistering commands.
 *
 * Note: Uses useLayoutEffect to ensure synchronous context activation during commit phase.
 * TeamContext is typically used in admin/super-admin views and is independent from
 * User/Program contexts (not nested, parallel hierarchy).
 *
 * @example
 * ```tsx
 * // In admin team detail page
 * function AdminTeamPage() {
 *   const { team } = useTeam();
 *
 *   return (
 *     <TeamContextProvider
 *       teamId={team.id}
 *       teamName={team.name}
 *     >
 *       <TeamDetailView team={team} />
 *     </TeamContextProvider>
 *   );
 * }
 * ```
 *
 * Context Stack Example:
 * ```
 * Before mount: [GlobalContext]
 * After mount:  [GlobalContext, TeamContext]
 * After unmount: [GlobalContext]
 * ```
 */
export const TeamContextProvider: React.FC<TeamContextProviderProps> = ({
  teamId,
  teamName,
  children
}) => {
  const registry = useCommandRegistry(); // Performance: Won't re-render when palette opens/closes

  // Manage team context lifecycle
  // Using useLayoutEffect for synchronous execution during commit phase
  useLayoutEffect(() => {
    // Create team context object
    const teamContext: TeamContext = {
      type: 'team',
      teamId,
      teamName
    };

    // Push context onto stack
    registry.pushContext(teamContext);

    // Register team-specific commands (4 commands: settings, members, patients, analytics)
    const teamCommands = getTeamCommands(teamId, teamName);
    registry.register(teamCommands);

    // Cleanup on unmount or prop changes
    return () => {
      // Pop context from stack
      registry.popContext();

      // Unregister all team commands
      teamCommands.forEach(cmd => registry.unregister(cmd.id));
    };
  }, [teamId, teamName, registry]);

  // Render children as fragment (no wrapper elements)
  return <>{children}</>;
};
