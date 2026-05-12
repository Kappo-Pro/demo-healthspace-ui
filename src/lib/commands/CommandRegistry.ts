/**
 * CommandRegistry - Core Command Palette Engine
 * Story 1.1: Core Registry Data Structure
 *
 * Singleton registry managing command registration, lookup, and context management
 * with O(1) performance using Map data structure.
 *
 * Security Features (SEC-3):
 * - DoS protection via MAX_COMMANDS limit (500)
 * - Rate limiting via MAX_REGISTRATIONS_PER_WINDOW (50/100ms)
 *
 * Security Features (Story 6.1):
 * - XSS prevention via InputSanitizer at registration
 */

import { EventEmitter } from 'events';
import {
  Command,
  CommandContext,
  CommandExecutionContext,
  CommandFilters,
  RegistryEvent,
  RegistryEventListener,
  RegistryEventType,
} from './types';
import {
  GLOBAL_CONTEXT,
  DEFAULT_MAX_COMMANDS,
  DEFAULT_MAX_REGISTRATIONS_PER_WINDOW,
  RATE_LIMIT_WINDOW_MS,
} from './constants';
import { filterCommands, sortByPriority } from './filters';
import { searchCommands } from './search';
import { InputSanitizer } from '../../services/security/InputSanitizer';

/**
 * CommandRegistry singleton class
 * Manages command registration, retrieval, and context stack
 */
export class CommandRegistry {
  /**
   * Singleton instance
   */
  private static instance: CommandRegistry | null = null;

  /**
   * Primary command storage - Map provides O(1) lookup
   * Key: command.id, Value: Command object
   */
  private commands: Map<string, Command>;

  /**
   * Context stack for hierarchical command filtering
   * Bottom: GLOBAL_CONTEXT (always present)
   * Top: Current most specific context
   */
  private contextStack: CommandContext[];

  /**
   * Event emitter for registry events
   * Enables analytics, debugging, and monitoring hooks
   */
  private eventEmitter: EventEmitter;

  /**
   * Maximum number of commands allowed (DoS protection - SEC-3)
   */
  private readonly MAX_COMMANDS: number;

  /**
   * Maximum registrations per time window (DoS protection - SEC-3)
   */
  private readonly MAX_REGISTRATIONS_PER_WINDOW: number;

  /**
   * Timestamps of recent registrations for rate limiting
   */
  private registrationTimestamps: number[];

  /**
   * Recent commands tracking (Story 1.4)
   * Tracks last 5 executed commands for quick access
   */
  private recentCommands: string[];

  /**
   * Private constructor enforces singleton pattern
   */
  constructor() {
    // Enforce singleton - return existing instance if present
    if (CommandRegistry.instance) {
      return CommandRegistry.instance;
    }

    this.commands = new Map<string, Command>();
    this.contextStack = [{ ...GLOBAL_CONTEXT }];
    this.eventEmitter = new EventEmitter();
    this.MAX_COMMANDS = DEFAULT_MAX_COMMANDS;
    this.MAX_REGISTRATIONS_PER_WINDOW = DEFAULT_MAX_REGISTRATIONS_PER_WINDOW;
    this.registrationTimestamps = [];
    this.recentCommands = [];

    // Story 1.4: Load recent commands from localStorage
    this.loadRecentCommands();

    CommandRegistry.instance = this;
  }

  /**
   * Get singleton instance
   * Provides explicit singleton access pattern
   */
  public static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  /**
   * Sanitize command text fields to prevent XSS (Story 6.1)
   * Applies InputSanitizer to label, description, and keywords
   *
   * @param command - Command to sanitize
   * @returns New command with sanitized text fields
   */
  private sanitizeCommand(command: Command): Command {
    return {
      ...command,
      label: InputSanitizer.sanitize(command.label),
      description: command.description
        ? InputSanitizer.sanitize(command.description)
        : undefined,
      keywords: command.keywords?.map((k) => InputSanitizer.sanitize(k)),
    };
  }

  /**
   * Register one or more commands
   *
   * @param commands - Single command or array of commands to register
   * @throws Error if DoS limits exceeded or rate limit triggered
   *
   * Security Checks (SEC-3):
   * 1. Total command count must not exceed MAX_COMMANDS
   * 2. Registration rate must not exceed MAX_REGISTRATIONS_PER_WINDOW
   *
   * Security Checks (Story 6.1):
   * 3. All command text fields (label, description, keywords) are sanitized against XSS
   */
  public register(commands: Command | Command[]): void {
    const cmds = Array.isArray(commands) ? commands : [commands];

    // SEC-3: Check total command limit
    if (this.commands.size + cmds.length > this.MAX_COMMANDS) {
      throw new Error(
        `Cannot register ${cmds.length} commands. Maximum ${this.MAX_COMMANDS} commands allowed.`
      );
    }

    // SEC-3: Check rate limit
    const now = Date.now();
    this.registrationTimestamps = this.registrationTimestamps.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS
    );

    if (
      this.registrationTimestamps.length + cmds.length >
      this.MAX_REGISTRATIONS_PER_WINDOW
    ) {
      throw new Error(
        `Too many commands registered too quickly. Maximum ${this.MAX_REGISTRATIONS_PER_WINDOW} registrations per ${RATE_LIMIT_WINDOW_MS}ms allowed.`
      );
    }

    // Story 6.1: Sanitize commands before registration (defense in depth - Layer 1)
    // Register commands and track timestamps
    cmds.forEach((cmd) => {
      const sanitizedCmd = this.sanitizeCommand(cmd);
      this.commands.set(sanitizedCmd.id, sanitizedCmd);
      this.registrationTimestamps.push(now);

      this.emitEvent('command:registered', {
        commandId: sanitizedCmd.id,
        commandLabel: sanitizedCmd.label,
      });
    });
  }

  /**
   * Unregister one or more commands by ID
   *
   * @param commandIds - Single ID or array of IDs to remove
   * @returns true/false for single ID, array of booleans for multiple IDs
   */
  public unregister(commandIds: string | string[]): boolean | boolean[] {
    // Handle single ID (original behavior)
    if (typeof commandIds === 'string') {
      const existed = this.commands.delete(commandIds);
      if (existed) {
        this.emitEvent('command:unregistered', { commandId: commandIds });
      }
      return existed;
    }

    // Handle array of IDs (new behavior)
    return commandIds.map((id) => {
      const existed = this.commands.delete(id);
      if (existed) {
        this.emitEvent('command:unregistered', { commandId: id });
      }
      return existed;
    });
  }

  /**
   * Get a single command by ID
   * O(1) lookup performance using Map
   *
   * @param commandId - ID of command to retrieve
   * @returns Command object or undefined if not found
   */
  public getCommand(commandId: string): Command | undefined {
    return this.commands.get(commandId);
  }

  /**
   * Get all commands matching filters (Stories 1.3, 3.1, 3.2, 3.3)
   *
   * Pipeline Architecture (Story 3.3):
   * Stage 1: Filter (enabled, hidden, context, category, role)
   * Stage 2: Search (if query provided - sorts by relevance score)
   * Stage 3: Sort by priority (if no query - search already sorts)
   *
   * @param filters - Optional filters to apply
   * @returns Array of matching commands (filtered, searched, sorted)
   *
   * @example
   * ```typescript
   * // Get commands for admin in current context
   * const commands = registry.getCommands({ roles: ['admin'] });
   *
   * // Search commands with query
   * const results = registry.getCommands({ query: 'dashboard', roles: ['admin'] });
   *
   * // Filter by category
   * const navCommands = registry.getCommands({ categories: ['navigation'] });
   * ```
   */
  public getCommands(filters?: CommandFilters): Command[] {
    let results = Array.from(this.commands.values());

    // STAGE 1: Apply multi-dimensional filtering (Story 3.2)
    // Filters: enabled, hidden, context, category, role
    if (filters) {
      results = filterCommands(results, filters, this.contextStack);
    } else {
      // No filters provided - still apply default filtering (enabled, hidden, context)
      results = filterCommands(results, {}, this.contextStack);
    }

    // STAGE 2: Apply search query with scoring (Story 3.1)
    // Only if query provided - search already sorts by relevance score
    if (filters?.query) {
      results = searchCommands(filters.query, results);
    } else {
      // STAGE 3: Sort by priority (Story 3.2)
      // Only if no search query (search already sorted by score)
      results = sortByPriority(results);
    }

    return results;
  }

  /**
   * Valid context transitions (SEC-5)
   * Prevents illogical context paths
   * Allows max depth of 5: global -> user -> program -> assessment -> report (future)
   * Or: global -> team (for admin/super-admin team management)
   * Or: global -> organization (for super-admin organization management - Story 2.3)
   * Or: global -> user -> program -> assessment (depth 4)
   *
   * Note: 'user' can be pushed from 'program' to support React effect ordering edge cases
   * where child effects may execute before parent effects during StrictMode or testing
   * Note: 'team' context added in Story 2.4 for admin/super-admin team management
   * Note: 'organization' context added in Story 2.3 for super-admin organization management
   */
  private readonly VALID_TRANSITIONS: Record<string, string[]> = {
    global: ['user', 'program', 'assessment', 'report', 'team', 'organization'],
    user: ['program', 'assessment', 'report'],
    program: ['user', 'assessment', 'report'], // Allow 'user' for recovery scenarios
    assessment: ['report'],
    report: [],
    team: [], // Team context is terminal (no further nesting)
    organization: ['user', 'team'], // Organization can transition to user or team contexts
  };

  /**
   * Validate if transition from one context to another is allowed
   * Part of SEC-5 security constraints
   *
   * @param from - Source context type
   * @param to - Target context type
   * @returns true if transition is valid
   */
  private isValidTransition(from: string, to: string): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * Push a new context onto the stack
   * Validates max depth (5) and legal transitions (SEC-5)
   *
   * @param context - Context to push
   * @throws Error if max depth exceeded or invalid transition
   */
  public pushContext(context: CommandContext): void {
    // Get current context for all checks
    const current = this.getActiveContext();

    // SEC-5: Max depth check
    if (this.contextStack.length >= 5) {
      throw new Error(
        'Max context depth 5 reached (SEC-5). Cannot push more contexts.'
      );
    }

    // Defensive: Check for duplicate context push (React StrictMode double-invocation)
    // This MUST happen before transition validation to handle Strict Mode's double-mount
    if (current.type === context.type) {
      // Deep equality check for common context types
      let isDuplicate = false;

      if (context.type === 'program' && current.type === 'program') {
        const currentProgram = current as { programId?: string; programName?: string };
        const newProgram = context as { programId?: string; programName?: string };
        isDuplicate =
          currentProgram.programId === newProgram.programId &&
          currentProgram.programName === newProgram.programName;
      } else if (context.type === 'user' && current.type === 'user') {
        const currentUser = current as { userId?: string; userName?: string };
        const newUser = context as { userId?: string; userName?: string };
        isDuplicate =
          currentUser.userId === newUser.userId &&
          currentUser.userName === newUser.userName;
      } else if (context.type === current.type) {
        // For other context types, if same type is considered duplicate
        isDuplicate = true;
      }

      if (isDuplicate) {
        return; // Skip pushing duplicate context
      }
    }

    // SEC-5: Validate legal transition
    if (!this.isValidTransition(current.type, context.type)) {
      throw new Error(
        `Invalid context transition from ${current.type} to ${context.type} (SEC-5)`
      );
    }

    this.contextStack.push(context);
    this.emitEvent('context:pushed', { contextType: context.type });
  }

  /**
   * Pop the top context from the stack
   * Cannot pop GLOBAL_CONTEXT (bottom of stack)
   *
   * @returns The popped context or undefined if at bottom
   */
  public popContext(): CommandContext | undefined {
    if (this.contextStack.length <= 1) {
      return undefined;
    }

    const popped = this.contextStack.pop();
    this.emitEvent('context:popped', { contextType: popped?.type });

    return popped;
  }

  /**
   * Get the active (top) context from the stack
   *
   * @returns Current active context
   */
  public getActiveContext(): CommandContext {
    return this.contextStack[this.contextStack.length - 1];
  }

  /**
   * Get the current (top) context (alias for getActiveContext)
   * @deprecated Use getActiveContext() instead
   *
   * @returns Current context
   */
  public getCurrentContext(): CommandContext {
    return this.getActiveContext();
  }

  /**
   * Get a readonly copy of the context stack
   * Returns immutable array to prevent external modifications
   *
   * @returns Readonly copy of context stack
   */
  public getContextStack(): readonly CommandContext[] {
    return [...this.contextStack];
  }

  /**
   * Clear all contexts except GLOBAL_CONTEXT
   * Resets context stack to initial state
   */
  public clearContexts(): void {
    this.contextStack = [this.contextStack[0]];
    this.emitEvent('contexts:cleared', {});
  }

  /**
   * Clear all contexts except GLOBAL_CONTEXT (alias for clearContexts)
   * @deprecated Use clearContexts() instead
   */
  public clearContextStack(): void {
    this.clearContexts();
  }

  /**
   * Execute a command with optional context overrides (Story 1.4 enhanced)
   *
   * @param commandId - ID of command to execute
   * @param contextOverrides - Optional context properties to override
   * @returns Result from command handler
   * @throws Error if command not found or not available in current context
   */
  public async execute(
    commandId: string,
    contextOverrides?: Record<string, unknown>
  ): Promise<unknown> {
    const command = this.commands.get(commandId);

    if (!command) {
      throw new Error(`Command not found or not available in current context: ${commandId}`);
    }

    // Check if command is available in current context
    const currentContext = this.getCurrentContext();
    const contextMatches = command.availableInContexts.some((ctx) => {
      if (ctx === 'global') return true;
      return currentContext.type === ctx;
    });

    if (!contextMatches) {
      throw new Error(`Command not found or not available in current context: ${commandId}`);
    }

    // Build execution context
    const executionContext: CommandExecutionContext = {
      ...currentContext,
      ...contextOverrides,
    } as CommandExecutionContext;

    // Story 1.4: Emit command:executing event BEFORE execution
    this.emitEvent('command:executing', {
      commandId,
      commandLabel: command.label,
      contextType: currentContext.type,
    });

    // Story 1.4: Performance tracking
    const startTime = performance.now();

    try {
      const result = await command.handler(executionContext);

      // Story 1.4: Calculate duration
      const duration = performance.now() - startTime;

      // Story 1.4: Emit command:executed with duration
      this.emitEvent('command:executed', {
        commandId,
        commandLabel: command.label,
        contextType: currentContext.type,
        duration,
      });

      // Story 1.4: Track recent command after success
      this.trackRecentCommand(commandId);

      return result;
    } catch (error) {
      // Story 1.4: Calculate duration even on error
      const duration = performance.now() - startTime;

      // Emit both command:error (Story 1.4) and command:executionFailed (backward compat)
      const errorPayload = {
        commandId,
        commandLabel: command.label,
        contextType: currentContext.type,
        error: error instanceof Error ? error.message : String(error),
        duration,
      };

      this.emitEvent('command:error', errorPayload);
      this.emitEvent('command:executionFailed', errorPayload);

      throw error;
    }
  }

  /**
   * Execute a command by ID (original method, uses execute() internally)
   *
   * @param commandId - ID of command to execute
   * @throws Error if command not found
   */
  public async executeCommand(commandId: string): Promise<void> {
    await this.execute(commandId);
  }

  /**
   * Add event listener
   *
   * @param eventType - Type of event to listen for
   * @param listener - Callback function
   */
  public on(eventType: RegistryEventType, listener: RegistryEventListener): void {
    this.eventEmitter.on(eventType, listener);
  }

  /**
   * Remove event listener
   *
   * @param eventType - Type of event
   * @param listener - Callback function to remove
   */
  public off(eventType: RegistryEventType, listener: RegistryEventListener): void {
    this.eventEmitter.off(eventType, listener);
  }

  /**
   * Emit a registry event
   *
   * @param type - Event type
   * @param data - Event data
   */
  private emitEvent(type: RegistryEventType, data: unknown): void {
    const event: RegistryEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.eventEmitter.emit(type, event);
  }

  /**
   * Clear all commands and reset registry to initial state
   * Useful for testing, hot reload, and error recovery
   */
  public clear(): void {
    // Clear all commands
    this.commands.clear();

    // Reset context stack to GLOBAL_CONTEXT only
    this.contextStack = [{ ...GLOBAL_CONTEXT }];

    // Clear rate limiting timestamps
    this.registrationTimestamps = [];

    // Story 1.4: Clear recent commands
    this.recentCommands = [];

    // Story 1.4: Reload recent commands from localStorage (for testing)
    this.loadRecentCommands();

    // Emit clear event
    this.emitEvent('registry:cleared', {
      timestamp: Date.now(),
    });
  }

  /**
   * Remove all event listeners (optional: for specific event type)
   * Useful for test cleanup and memory management
   *
   * @param eventType - Optional event type to clear listeners for
   */
  public removeAllListeners(eventType?: RegistryEventType): void {
    if (eventType) {
      this.eventEmitter.removeAllListeners(eventType);
    } else {
      this.eventEmitter.removeAllListeners();
    }
  }

  /**
   * Get registry statistics (useful for debugging/monitoring)
   */
  public getStats() {
    return {
      totalCommands: this.commands.size,
      maxCommands: this.MAX_COMMANDS,
      contextStackDepth: this.contextStack.length,
      currentContextType: this.getCurrentContext().type,
      recentRegistrations: this.registrationTimestamps.length,
      recentCommandsCount: this.recentCommands.length,
    };
  }

  /**
   * Story 1.4: Validate if a command can be executed
   * Checks command existence, enabled state, and role requirements
   *
   * @param commandId - ID of command to check
   * @param userRole - Optional user role to validate against
   * @returns true if command can be executed, false otherwise
   */
  public canExecute(
    commandId: string,
    userRole?: 'super-admin' | 'admin' | 'user'
  ): boolean {
    const command = this.commands.get(commandId);

    // Command must exist and be enabled
    if (!command || command.enabled === false) {
      return false;
    }

    // If command has role requirements and userRole provided, validate
    if (command.allowedRoles && userRole) {
      return command.allowedRoles.includes(userRole);
    }

    // No role requirements or no userRole to check - allow execution
    return true;
  }

  /**
   * Story 1.4: Track a recently executed command
   * Maintains max 5 commands, removes duplicates, persists to localStorage
   *
   * @param commandId - ID of executed command
   */
  private trackRecentCommand(commandId: string): void {
    // Remove if already exists (move to front)
    this.recentCommands = this.recentCommands.filter((id) => id !== commandId);

    // Add to front
    this.recentCommands.unshift(commandId);

    // Keep max 5
    if (this.recentCommands.length > 5) {
      this.recentCommands.pop();
    }

    // Persist to localStorage
    this.saveRecentCommands();
  }

  /**
   * Story 1.4: Get recent commands
   * Returns copy to prevent external modifications
   *
   * @returns Array of recent command IDs (max 5)
   */
  public getRecentCommands(): string[] {
    return [...this.recentCommands];
  }

  /**
   * Story 1.4: Load recent commands from localStorage
   * Called during initialization
   */
  private loadRecentCommands(): void {
    try {
      const stored = localStorage.getItem('command-palette-recent');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.recentCommands = parsed.slice(0, 5); // Ensure max 5
        }
      }
    } catch (error) {
      this.recentCommands = [];
    }
  }

  /**
   * Story 1.4: Save recent commands to localStorage
   * Called after each successful command execution
   */
  private saveRecentCommands(): void {
    try {
      localStorage.setItem(
        'command-palette-recent',
        JSON.stringify(this.recentCommands)
      );
    } catch (error) {
      // Graceful degradation - continue without persistence
    }
  }
}

/**
 * Singleton instance export
 * Use this throughout the application
 */
export const commandRegistry = new CommandRegistry();
