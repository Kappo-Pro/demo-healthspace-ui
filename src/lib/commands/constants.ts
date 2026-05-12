/**
 * Command Palette Constants
 * Story 1.1: Core Registry Data Structure
 */

import { GlobalContext } from './types';

/**
 * Global context singleton - always at bottom of context stack
 * Initialized with placeholder values, will be updated on app init
 */
export const GLOBAL_CONTEXT: GlobalContext = {
  type: 'global',
  userId: '',
  userRole: 'user',
};

/**
 * Default debounce delay for search input (milliseconds)
 */
export const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Maximum number of commands allowed in registry
 * DoS protection measure (SEC-3)
 */
export const DEFAULT_MAX_COMMANDS = 500;

/**
 * Maximum number of command registrations allowed per time window
 * DoS protection measure (SEC-3)
 */
export const DEFAULT_MAX_REGISTRATIONS_PER_WINDOW = 50;

/**
 * Time window for rate limiting in milliseconds
 * DoS protection measure (SEC-3)
 */
export const RATE_LIMIT_WINDOW_MS = 100;
