/**
 * Team Commands Configuration
 * Story 2.4: Team-specific command definitions
 */

import type { Command } from '../../lib/commands/types';

/**
 * Get team-specific commands based on team context
 *
 * @param teamId - Team ID for command handlers and unique command IDs
 * @param teamName - Team's display name for labels
 * @returns Array of team-specific commands (4 commands: settings, members, patients, analytics)
 *
 * @example
 * ```ts
 * const commands = getTeamCommands('team-123', 'Care Team Alpha');
 * // Returns commands: team-settings-team-123, team-members-team-123,
 * //                   team-patients-team-123, team-analytics-team-123
 * ```
 */
export const getTeamCommands = (
  teamId: string,
  teamName: string
): Command[] => {
  return [
    {
      id: `team-settings-${teamId}`,
      label: `${teamName} Settings`,
      description: 'Manage team settings and configuration',
      availableInContexts: ['team'],
      category: 'settings',
      allowedRoles: ['super-admin', 'admin'],
      priority: 85,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/admin/teams/${teamId}/settings`);
      }
    },
    {
      id: `team-members-${teamId}`,
      label: `View ${teamName} Members`,
      description: 'View and manage team members',
      availableInContexts: ['team'],
      category: 'navigation',
      allowedRoles: ['super-admin', 'admin'],
      priority: 80,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/admin/teams/${teamId}/members`);
      }
    },
    {
      id: `team-patients-${teamId}`,
      label: `${teamName} Patients`,
      description: 'View patients assigned to this team',
      availableInContexts: ['team'],
      category: 'navigation',
      allowedRoles: ['super-admin', 'admin'],
      priority: 75,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/admin/teams/${teamId}/patients`);
      }
    },
    {
      id: `team-analytics-${teamId}`,
      label: `${teamName} Analytics`,
      description: 'View team analytics and performance reports',
      availableInContexts: ['team'],
      category: 'navigation',
      allowedRoles: ['super-admin', 'admin'],
      priority: 70,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/admin/teams/${teamId}/analytics`);
      }
    }
  ];
};
