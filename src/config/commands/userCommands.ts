/**
 * User Commands Configuration
 * Story 2.1: User-specific command definitions
 */

import type { Command } from '../../lib/commands/types';

/**
 * Get user-specific commands based on user context
 *
 * @param userId - User ID for command handlers
 * @param userName - User's display name for labels
 * @param userRole - User's role for conditional commands
 * @returns Array of user-specific commands
 *
 * @example
 * ```ts
 * const commands = getUserCommands('123', 'John Doe', 'admin');
 * // Returns commands: user-profile-123, user-settings-123, user-logout-123, user-admin-panel-123
 * ```
 */
export const getUserCommands = (
  userId: string,
  userName: string,
  userRole: 'super-admin' | 'admin' | 'user'
): Command[] => {
  const commands: Command[] = [
    {
      id: `user-profile-${userId}`,
      label: `View ${userName}'s Profile`,
      description: 'Navigate to user profile page',
      availableInContexts: ['user'],
      category: 'navigation',
      priority: 80,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/profile`);
      }
    },
    {
      id: `user-settings-${userId}`,
      label: 'User Settings',
      description: 'Open user settings',
      availableInContexts: ['user'],
      category: 'settings',
      priority: 70,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/settings`);
      }
    },
    {
      id: `user-logout-${userId}`,
      label: 'Logout',
      description: 'Logout current user',
      availableInContexts: ['user'],
      category: 'navigation',
      priority: 50,
      handler: async () => {
        // TODO: Implement logout when auth utilities are available
        // await logout();
        // navigateTo('/login');
      }
    }
  ];

  // Add admin-specific commands for admin and super-admin roles
  if (userRole === 'admin' || userRole === 'super-admin') {
    commands.push({
      id: `user-admin-panel-${userId}`,
      label: 'Admin Panel',
      description: 'Open admin panel',
      availableInContexts: ['user'],
      category: 'navigation',
      allowedRoles: ['admin', 'super-admin'],
      priority: 90,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo('/admin/dashboard');
      }
    });
  }

  return commands;
};
