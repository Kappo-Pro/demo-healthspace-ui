/**
 * Program Commands Configuration
 * Story 2.2: Program-specific command definitions
 */

import type { Command } from '../../lib/commands/types';

/**
 * Program types supported by the command palette
 */
export type ProgramType = 'rom' | 'rehab' | 'posture' | 'survey';

/**
 * Get program-specific commands based on program context
 *
 * @param userId - User ID for command handlers
 * @param programId - Program ID for command handlers and IDs
 * @param programName - Program's display name for labels
 * @param programType - Program type for type-specific commands
 * @returns Array of program-specific commands
 *
 * @example
 * ```ts
 * const commands = getProgramCommands('user-123', 'rom-1', 'ROM Assessment', 'rom');
 * // Returns commands: program-start-rom-1, program-results-rom-1, program-joint-angles-rom-1, etc.
 * ```
 */
export const getProgramCommands = (
  userId: string,
  programId: string,
  programName: string,
  programType: ProgramType
): Command[] => {
  const commands: Command[] = [
    {
      id: `program-start-${programId}`,
      label: `Start ${programName}`,
      description: 'Start or resume program assessment',
      availableInContexts: ['program'],
      category: 'program',
      priority: 90,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/programs/${programId}/start`);
      }
    },
    {
      id: `program-results-${programId}`,
      label: `View ${programName} Results`,
      description: 'View program results and analytics',
      availableInContexts: ['program'],
      category: 'navigation',
      priority: 80,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/programs/${programId}/results`);
      }
    },
    {
      id: `program-history-${programId}`,
      label: `${programName} History`,
      description: 'View program session history',
      availableInContexts: ['program'],
      category: 'navigation',
      priority: 70,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/programs/${programId}/history`);
      }
    },
    {
      id: `program-settings-${programId}`,
      label: 'Program Settings',
      description: 'Configure program settings',
      availableInContexts: ['program'],
      category: 'settings',
      priority: 60,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/programs/${programId}/settings`);
      }
    }
  ];

  // Add program-type-specific commands
  if (programType === 'rom') {
    commands.push({
      id: `program-joint-angles-${programId}`,
      label: 'View Joint Angles',
      description: 'View ROM joint angle measurements',
      availableInContexts: ['program'],
      category: 'navigation',
      priority: 85,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/programs/${programId}/joint-angles`);
      }
    });
  } else if (programType === 'rehab') {
    commands.push({
      id: `program-exercises-${programId}`,
      label: 'View Exercises',
      description: 'View rehab exercise library',
      availableInContexts: ['program'],
      category: 'navigation',
      priority: 85,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/programs/${programId}/exercises`);
      }
    });
  } else if (programType === 'posture') {
    commands.push({
      id: `program-posture-analysis-${programId}`,
      label: 'Posture Analysis',
      description: 'View detailed posture analysis',
      availableInContexts: ['program'],
      category: 'navigation',
      priority: 85,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/programs/${programId}/analysis`);
      }
    });
  } else if (programType === 'survey') {
    commands.push({
      id: `program-survey-responses-${programId}`,
      label: 'View Survey Responses',
      description: 'View survey responses and feedback',
      availableInContexts: ['program'],
      category: 'navigation',
      priority: 85,
      handler: async () => {
        // TODO: Implement navigation when navigation utilities are available
        // navigateTo(`/users/${userId}/programs/${programId}/responses`);
      }
    });
  }

  return commands;
};
