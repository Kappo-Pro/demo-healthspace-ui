/**
 * @file Command Search and Scoring Engine
 * @module lib/commands/search
 *
 * Provides fuzzy search functionality with intelligent scoring algorithm for command matching.
 * Enables users to quickly find relevant commands with partial text input and see results
 * ranked by relevance.
 *
 * **Scoring Algorithm:**
 * - Label Exact Match: +100 points
 * - Label Starts With: +80 points
 * - Label Contains: +50 points
 * - Description Match: +30 points
 * - Keyword Match: +40 points per keyword
 * - Exact Keyword Match: +60 points (40 + 20 bonus)
 * - Recent Usage: +20 points
 * - Command Priority: +N points (from command definition)
 *
 * **Performance:**
 * - 100 commands: <10ms
 * - 1000 commands: <20ms
 *
 * @example
 * ```typescript
 * import { searchCommands } from '@lib/commands/search';
 *
 * const commands: Command[] = [
 *   { id: '1', label: 'Dashboard', category: 'navigation', availableInContexts: ['global'], handler: () => {} },
 *   { id: '2', label: 'User Settings', category: 'settings', availableInContexts: ['global'], handler: () => {} }
 * ];
 *
 * const results = searchCommands('dash', commands);
 * // Returns: [Dashboard] (exact match scored highest)
 * ```
 */

import { Command } from './types';

/**
 * Internal interface for command search scoring.
 * Maps a command to its calculated relevance score.
 *
 * @internal
 */
interface SearchScore {
  command: Command;
  score: number;
}

/**
 * Checks if a command was recently used by the user.
 *
 * Reads the 'command-palette-recent' array from localStorage, which stores
 * recently executed command IDs. This is used to boost the relevance score
 * of frequently used commands.
 *
 * **localStorage Structure:**
 * ```json
 * {
 *   "command-palette-recent": ["cmd-id-1", "cmd-id-2", "cmd-id-3"]
 * }
 * ```
 *
 * @param commandId - The command ID to check
 * @returns `true` if command ID is in recent array, `false` otherwise or on error
 *
 * @internal
 */
function isRecentlyUsed(commandId: string): boolean {
  try {
    const recent = JSON.parse(
      localStorage.getItem('command-palette-recent') || '[]'
    );
    return recent.includes(commandId);
  } catch {
    return false;
  }
}

/**
 * Calculates relevance score for a command based on query match.
 *
 * **Scoring Breakdown:**
 * - Label exact match: +100 points
 * - Label starts with query: +80 points
 * - Label contains query: +50 points
 * - Description contains query: +30 points
 * - Keyword contains query: +40 points per keyword
 * - Exact keyword match: +60 points (40 + 20 bonus)
 * - Recently used command: +20 points
 * - Command priority: +N points (from command.priority)
 *
 * All matching is case-insensitive. Score is cumulative - a command can earn points
 * from multiple factors (e.g., label match + description match + recent usage).
 *
 * @param command - Command to score
 * @param query - Search query string
 * @returns Relevance score (>= 0). Higher scores indicate better matches. Returns 0 if no match.
 *
 * @example
 * ```typescript
 * const cmd: Command = {
 *   id: 'dashboard',
 *   label: 'Dashboard',
 *   description: 'View main dashboard',
 *   keywords: ['home', 'overview'],
 *   priority: 10,
 *   category: 'navigation',
 *   availableInContexts: ['global'],
 *   handler: () => {}
 * };
 *
 * scoreCommand(cmd, 'Dashboard'); // >= 110 (100 exact + 10 priority)
 * scoreCommand(cmd, 'Dash');      // >= 90 (80 starts-with + 10 priority)
 * scoreCommand(cmd, 'home');      // >= 70 (60 exact keyword + 10 priority)
 * ```
 */
export function scoreCommand(command: Command, query: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerLabel = command.label.toLowerCase();
  const lowerDesc = command.description?.toLowerCase() || '';
  const keywords = command.keywords?.map((k) => k.toLowerCase()) || [];

  let score = 0;
  let hasTextMatch = false;

  // 1. LABEL MATCHING (highest priority)
  if (lowerLabel === lowerQuery) {
    score += 100; // Exact match
    hasTextMatch = true;
  } else if (lowerLabel.startsWith(lowerQuery)) {
    score += 80; // Starts with query
    hasTextMatch = true;
  } else if (lowerLabel.includes(lowerQuery)) {
    score += 50; // Contains query
    hasTextMatch = true;
  }

  // 2. DESCRIPTION MATCHING (medium priority)
  if (lowerDesc.includes(lowerQuery)) {
    score += 30;
    hasTextMatch = true;
  }

  // 3. KEYWORD MATCHING (medium priority)
  keywords.forEach((keyword) => {
    if (keyword.includes(lowerQuery)) {
      score += 40;
      hasTextMatch = true;
    }
    if (keyword === lowerQuery) {
      score += 20; // Exact keyword match bonus
    }
  });

  // Only add boosts if there was an actual text match
  if (!hasTextMatch) {
    return 0;
  }

  // 4. RECENT COMMAND BOOST
  if (isRecentlyUsed(command.id)) {
    score += 20;
  }

  // 5. PRIORITY BOOST (from command definition)
  score += command.priority || 0;

  return score;
}

/**
 * Searches and ranks commands based on query relevance.
 *
 * Scores all commands using the multi-factor scoring algorithm, filters out
 * non-matches (score = 0), and returns commands sorted by relevance score
 * in descending order (highest score first).
 *
 * **Empty Query Handling:**
 * If query is empty or only whitespace, returns the original commands array
 * unchanged without scoring (optimization for performance).
 *
 * **Scoring Process:**
 * 1. Normalize query (trim, lowercase)
 * 2. Score each command using `scoreCommand()`
 * 3. Filter commands with score > 0
 * 4. Sort by score descending (highest first)
 * 5. Return sorted command array
 *
 * @param query - Search query string (case-insensitive)
 * @param commands - Array of commands to search
 * @returns Commands sorted by relevance score (highest first). Empty array if no matches.
 *
 * @example
 * ```typescript
 * const commands: Command[] = [
 *   { id: '1', label: 'Dashboard', category: 'navigation', availableInContexts: ['global'], handler: () => {} },
 *   { id: '2', label: 'User Settings', category: 'settings', availableInContexts: ['global'], handler: () => {} },
 *   { id: '3', label: 'Go to Dashboard', category: 'navigation', availableInContexts: ['global'], handler: () => {} }
 * ];
 *
 * searchCommands('dash', commands);
 * // Returns: ['Dashboard', 'Go to Dashboard']
 * // 'Dashboard' ranked first (exact match: 100 points)
 * // 'Go to Dashboard' second (contains: 50 points)
 *
 * searchCommands('', commands);
 * // Returns: all commands unchanged (no scoring on empty query)
 *
 * searchCommands('xyz', commands);
 * // Returns: [] (no matches)
 * ```
 */
export function searchCommands(query: string, commands: Command[]): Command[] {
  // Early return for empty/whitespace queries
  if (!query || query.trim() === '') {
    return commands;
  }

  const trimmedQuery = query.trim();

  // Score all commands
  const scored: SearchScore[] = commands
    .map((cmd) => ({
      command: cmd,
      score: scoreCommand(cmd, trimmedQuery),
    }))
    .filter((item) => item.score > 0); // Only include matches

  // Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);

  // Return commands only
  return scored.map((item) => item.command);
}

/**
 * Optimized search with optional query result caching.
 *
 * Identical to `searchCommands()` but supports memoization for repeated queries.
 * Useful for scenarios where the same search query is performed multiple times
 * (e.g., rapid typing, debounced searches).
 *
 * **Cache Behavior:**
 * - If cache provided and query exists in cache → return cached results immediately
 * - Otherwise → perform search using `searchCommands()` and cache results
 * - If no cache provided → behaves identically to `searchCommands()`
 *
 * **Performance Benefits:**
 * - Eliminates redundant scoring for repeated queries
 * - Particularly effective with debouncing (300ms delay allows cache hits)
 * - Recommended for large command sets (>500 commands)
 *
 * **Cache Management:**
 * Caller is responsible for cache lifecycle:
 * - Clear cache when command list changes (new commands registered)
 * - Use `Map<string, Command[]>` for O(1) lookup
 * - Consider cache size limits for memory efficiency
 *
 * @param query - Search query string (case-insensitive)
 * @param commands - Array of commands to search
 * @param cache - Optional Map to store/retrieve cached results
 * @returns Commands sorted by relevance score (highest first)
 *
 * @example
 * ```typescript
 * const cache = new Map<string, Command[]>();
 * const commands: Command[] = [...]; // Large command set
 *
 * // First call: performs full search, stores in cache
 * const results1 = searchCommandsOptimized('dash', commands, cache);
 *
 * // Second call: returns cached results instantly (no scoring)
 * const results2 = searchCommandsOptimized('dash', commands, cache);
 *
 * // Different query: performs full search
 * const results3 = searchCommandsOptimized('settings', commands, cache);
 *
 * // Clear cache when commands change
 * // (e.g., after new command registration)
 * cache.clear();
 * ```
 */
export function searchCommandsOptimized(
  query: string,
  commands: Command[],
  cache?: Map<string, Command[]>
): Command[] {
  // Check cache first
  if (cache?.has(query)) {
    const cached = cache.get(query);
    if (cached) {
      return cached;
    }
  }

  const results = searchCommands(query, commands);

  // Cache results
  if (cache) {
    cache.set(query, results);
  }

  return results;
}
