/**
 * Command Palette Utility Functions
 * Story 1.5: Validation & Testing Framework
 *
 * Provides validation functions and type guards for CommandRegistry
 */

import {
  Command,
  CommandContext,
  UserContext,
  ProgramContext,
  AssessmentContext,
  ReportContext,
} from './types';

/**
 * Validates a command object has all required fields
 * Throws descriptive errors for missing or invalid fields
 *
 * @param cmd - Command object to validate
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * validateCommand({
 *   id: 'go-home',
 *   label: 'Go to Home',
 *   availableInContexts: ['global'],
 *   category: 'navigation',
 *   handler: () => navigate('/home')
 * }); // No error
 *
 * validateCommand({ id: 'missing-label' }); // Throws: "Command must have a valid label"
 * ```
 */
export function validateCommand(cmd: unknown): asserts cmd is Command {
  if (typeof cmd !== 'object' || cmd === null) {
    throw new Error('Command must be a valid object');
  }

  const command = cmd as Partial<Command>;

  if (!command.id || typeof command.id !== 'string') {
    throw new Error('Command must have a valid id (non-empty string)');
  }

  if (!command.label || typeof command.label !== 'string') {
    throw new Error('Command must have a valid label (non-empty string)');
  }

  if (!Array.isArray(command.availableInContexts) || command.availableInContexts.length === 0) {
    throw new Error('Command must have at least one context in availableInContexts array');
  }

  if (!command.category || typeof command.category !== 'string') {
    throw new Error('Command must have a valid category (non-empty string)');
  }

  if (typeof command.handler !== 'function') {
    throw new Error('Command must have a handler function');
  }
}

/**
 * Type guard to check if an unknown object is a valid Command
 *
 * @param obj - Object to check
 * @returns true if object is a valid Command, false otherwise
 *
 * @example
 * ```typescript
 * const obj = { id: 'test', label: 'Test', ... };
 * if (isCommand(obj)) {
 *   // TypeScript knows obj is Command here
 *   registry.register(obj);
 * }
 * ```
 */
export function isCommand(obj: unknown): obj is Command {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const cmd = obj as Partial<Command>;

  return (
    typeof cmd.id === 'string' &&
    typeof cmd.label === 'string' &&
    Array.isArray(cmd.availableInContexts) &&
    cmd.availableInContexts.length > 0 &&
    typeof cmd.category === 'string' &&
    typeof cmd.handler === 'function'
  );
}

/**
 * Type guard to check if a context is a UserContext
 *
 * @param ctx - CommandContext to check
 * @returns true if context is UserContext
 */
export function isUserContext(ctx: CommandContext): ctx is UserContext {
  return ctx.type === 'user';
}

/**
 * Type guard to check if a context is a ProgramContext
 *
 * @param ctx - CommandContext to check
 * @returns true if context is ProgramContext
 */
export function isProgramContext(ctx: CommandContext): ctx is ProgramContext {
  return ctx.type === 'program';
}

/**
 * Type guard to check if a context is an AssessmentContext
 *
 * @param ctx - CommandContext to check
 * @returns true if context is AssessmentContext
 */
export function isAssessmentContext(ctx: CommandContext): ctx is AssessmentContext {
  return ctx.type === 'assessment';
}

/**
 * Type guard to check if a context is a ReportContext
 *
 * @param ctx - CommandContext to check
 * @returns true if context is ReportContext
 */
export function isReportContext(ctx: CommandContext): ctx is ReportContext {
  return ctx.type === 'report';
}

/**
 * Type guard to check if a context is a GlobalContext
 *
 * @param ctx - CommandContext to check
 * @returns true if context is GlobalContext
 */
export function isGlobalContext(ctx: CommandContext): ctx is import('./types').GlobalContext {
  return ctx.type === 'global';
}
