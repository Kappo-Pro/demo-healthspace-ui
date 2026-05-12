/**
 * Command Filtering Engine
 * Story 3.2: Multi-dimensional command filtering system
 *
 * Provides filtering, sorting, and indexing capabilities for command registry:
 * - filterCommands: Multi-dimensional filtering by enabled, hidden, context, category, and role
 * - sortByPriority: Sort commands by priority (highest first)
 * - groupByCategory: Group commands into category-based Map
 * - CommandIndex: O(1) lookup indexes for category, context, and role
 *
 * Performance target: <5ms for 100 commands
 */

import type { Command, CommandFilters, CommandContext } from './types';

/**
 * Filters commands by multiple criteria in optimized sequence
 *
 * Filter application order (performance optimized):
 * 1. Enabled status (cheapest check, reduces dataset)
 * 2. Hidden status (cheap check, further reduces dataset)
 * 3. Context matching (moderate cost on reduced set)
 * 4. Category filtering (cheap array check)
 * 5. Role filtering (moderate cost with default-allow logic)
 *
 * @param commands - Array of commands to filter
 * @param filters - Filter criteria to apply
 * @param contextStack - Active context stack from CommandRegistry
 * @returns Filtered array of commands (new array, doesn't mutate input)
 *
 * @example
 * ```typescript
 * const contextStack: CommandContext[] = [
 *   { type: 'global', userId: '123', userRole: 'admin' },
 *   { type: 'user', userId: '456', userName: 'John', userRole: 'admin' }
 * ];
 *
 * const filtered = filterCommands(
 *   allCommands,
 *   { roles: ['admin'], categories: ['navigation'] },
 *   contextStack
 * );
 * // Returns: commands available in global/user contexts, for admin role, in navigation category
 * ```
 */
export function filterCommands(
  commands: Command[],
  filters: CommandFilters,
  contextStack: CommandContext[]
): Command[] {
  let results = [...commands];

  // FILTER 1: ENABLED STATUS
  // cmd.enabled !== false means enabled (undefined and true both pass, only explicit false filtered)
  results = results.filter(cmd => cmd.enabled !== false);

  // FILTER 2: HIDDEN STATUS
  // !cmd.hidden means visible (only explicit true is filtered out)
  results = results.filter(cmd => !cmd.hidden);

  // FILTER 3: CONTEXT FILTER
  // Match command contexts against active context stack types
  // Only apply if contextStack has items (empty stack = no context filtering)
  if (contextStack.length > 0) {
    const activeContextTypes = contextStack.map(ctx => ctx.type);
    results = results.filter(cmd =>
      cmd.availableInContexts.some(ctx => activeContextTypes.includes(ctx))
    );
  }

  // FILTER 4: CATEGORY FILTER
  // Include only commands in specified categories
  if (filters.categories && filters.categories.length > 0) {
    results = results.filter(cmd =>
      filters.categories?.includes(cmd.category)
    );
  }

  // FILTER 5: ROLE FILTER
  // Default-allow: Commands without allowedRoles are available to all users
  // Commands with allowedRoles only visible to users with matching role
  // Empty roles array means user has no roles (should only see unrestricted commands)
  if (filters.roles !== undefined) {
    results = results.filter(cmd => {
      // No role requirement = available to all
      if (!cmd.allowedRoles || cmd.allowedRoles.length === 0) {
        return true;
      }

      // User has no roles = can't access role-restricted commands
      if ((filters.roles?.length ?? 0) === 0) {
        return false;
      }

      // Check if user has any required role
      return cmd.allowedRoles.some(role => filters.roles?.includes(role));
    });
  }

  return results;
}

/**
 * Sorts commands by priority in descending order (highest priority first)
 *
 * Commands without priority property default to 0.
 * Creates a shallow copy - does not mutate the original array.
 *
 * @param commands - Array of commands to sort
 * @returns New sorted array (original unchanged)
 *
 * @example
 * ```typescript
 * const sorted = sortByPriority([
 *   { id: 'a', priority: 5, ... },
 *   { id: 'b', priority: 10, ... },
 *   { id: 'c', ... } // priority undefined, treated as 0
 * ]);
 * // Returns: [b (10), a (5), c (0)]
 * ```
 */
export function sortByPriority(commands: Command[]): Command[] {
  return [...commands].sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Groups commands by category into a Map
 *
 * Each category key maps to an array of commands in that category.
 * Useful for rendering categorized command lists in UI.
 *
 * @param commands - Array of commands to group
 * @returns Map with category keys and command array values
 *
 * @example
 * ```typescript
 * const grouped = groupByCategory(commands);
 * // Returns: Map {
 * //   'navigation' => [cmd1, cmd2],
 * //   'action' => [cmd3],
 * //   'settings' => [cmd4, cmd5, cmd6]
 * // }
 *
 * // Usage in UI:
 * for (const [category, cmds] of grouped.entries()) {
 *    * }
 * ```
 */
export function groupByCategory(commands: Command[]): Map<string, Command[]> {
  const grouped = new Map<string, Command[]>();

  commands.forEach(cmd => {
    const category = cmd.category;
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    const categoryCommands = grouped.get(category);
    if (categoryCommands) {
      categoryCommands.push(cmd);
    }
  });

  return grouped;
}

/**
 * CommandIndex - Pre-built lookup indexes for O(1) command access
 *
 * Use for large command sets (1000+) where repeated filtering would be expensive.
 * Builds three separate Map indexes on construction:
 * - byCategory: Map<category, Command[]>
 * - byContext: Map<context, Command[]>
 * - byRole: Map<role, Command[]>
 *
 * Time Complexity:
 * - Construction: O(n*c*r) where n=commands, c=avg contexts, r=avg roles (~3-5)
 * - Lookups: O(1) for all getBy* methods
 *
 * Space Complexity: O(n*i) where i=total index entries (~3x for 3 indexes)
 *
 * @example
 * ```typescript
 * // Build index once for large command set
 * const index = new CommandIndex(allCommands);
 *
 * // O(1) lookups instead of O(n) filtering
 * const navCommands = index.getByCategory('navigation');
 * const userCommands = index.getByContext('user');
 * const adminCommands = index.getByRole('admin');
 * ```
 */
export class CommandIndex {
  private byCategory: Map<string, Command[]> = new Map();
  private byContext: Map<string, Command[]> = new Map();
  private byRole: Map<string, Command[]> = new Map();

  constructor(commands: Command[]) {
    this.buildIndex(commands);
  }

  /**
   * Builds all three indexes from command array
   * @private
   */
  private buildIndex(commands: Command[]): void {
    commands.forEach(cmd => {
      // Index by category
      if (!this.byCategory.has(cmd.category)) {
        this.byCategory.set(cmd.category, []);
      }
      const categoryCommands = this.byCategory.get(cmd.category);
      if (categoryCommands) {
        categoryCommands.push(cmd);
      }

      // Index by context (command can be in multiple contexts)
      cmd.availableInContexts.forEach(ctx => {
        if (!this.byContext.has(ctx)) {
          this.byContext.set(ctx, []);
        }
        const contextCommands = this.byContext.get(ctx);
        if (contextCommands) {
          contextCommands.push(cmd);
        }
      });

      // Index by role (command can have multiple required roles)
      cmd.allowedRoles?.forEach(role => {
        if (!this.byRole.has(role)) {
          this.byRole.set(role, []);
        }
        const roleCommands = this.byRole.get(role);
        if (roleCommands) {
          roleCommands.push(cmd);
        }
      });
    });
  }

  /**
   * Get commands by category (O(1) lookup)
   *
   * @param category - Category to look up
   * @returns Array of commands in category, or empty array if none
   */
  getByCategory(category: string): Command[] {
    return this.byCategory.get(category) || [];
  }

  /**
   * Get commands by context type (O(1) lookup)
   *
   * @param context - Context type to look up
   * @returns Array of commands available in context, or empty array if none
   */
  getByContext(context: string): Command[] {
    return this.byContext.get(context) || [];
  }

  /**
   * Get commands by role (O(1) lookup)
   *
   * @param role - Role to look up
   * @returns Array of commands requiring role, or empty array if none
   */
  getByRole(role: string): Command[] {
    return this.byRole.get(role) || [];
  }
}
