/**
 * Command Palette Type Definitions
 * Story 1.1: Core Registry Data Structure
 */

/**
 * Command categories for grouping and filtering
 */
export type CommandCategory =
  | 'navigation'
  | 'patient'
  | 'program'
  | 'settings'
  | 'system'
  | string; // Allow custom categories for extensibility

/**
 * Base context interface
 */
interface BaseContext {
  type: string;
}

/**
 * Global context - always available at bottom of context stack
 */
export interface GlobalContext extends BaseContext {
  type: 'global';
  userId: string;
  userRole: 'super-admin' | 'admin' | 'user';
}

/**
 * User-specific context
 */
export interface UserContext extends BaseContext {
  type: 'user';
  userId: string;
  userName: string;
  userRole: string;
}

/**
 * Program-specific context
 */
export interface ProgramContext extends BaseContext {
  type: 'program';
  programId: string;
  programName: string;
}

/**
 * Assessment-specific context
 */
export interface AssessmentContext extends BaseContext {
  type: 'assessment';
  assessmentId: string;
  assessmentType: 'rom' | 'rehab' | 'posture' | 'survey';
}

/**
 * Report-specific context
 */
export interface ReportContext extends BaseContext {
  type: 'report';
  reportId: string;
  patientId: string;
}

/**
 * Organization-specific context
 * Story 2.3: Super-admin organization management
 */
export interface OrganizationContext extends BaseContext {
  type: 'organization';
  organizationId: string;
  organizationName: string;
}

/**
 * Team-specific context
 */
export interface TeamContext extends BaseContext {
  type: 'team';
  teamId: string;
  teamName: string;
}

/**
 * Discriminated union of all context types
 * Enables type-safe context handling
 */
export type CommandContext =
  | GlobalContext
  | UserContext
  | ProgramContext
  | AssessmentContext
  | ReportContext
  | OrganizationContext
  | TeamContext;

/**
 * Command execution context - wraps CommandContext with optional overrides
 * Allows passing custom properties during command execution (e.g., for testing)
 */
export type CommandExecutionContext = CommandContext & {
  /** Allow custom properties for testing/extension */
  [key: string]: unknown;
};

/**
 * Command handler function signature
 */
export type CommandHandler = (context: CommandContext) => void | Promise<void> | unknown | Promise<unknown>;

/**
 * Core Command interface
 * 15 properties as specified in tech spec
 */
export interface Command {
  /** Unique identifier for the command */
  id: string;

  /** Display label shown in command palette */
  label: string;

  /** Command category for grouping */
  category: CommandCategory;

  /** Optional description for better searchability */
  description?: string;

  /** Optional keyboard shortcut (e.g., "g p" for "go to programs") */
  shortcut?: string;

  /** Optional icon component or icon name */
  icon?: React.ReactNode | string;

  /** Handler function executed when command is selected */
  handler: CommandHandler;

  /** Contexts in which this command is available */
  availableInContexts: CommandContext['type'][];

  /** Roles allowed to execute this command */
  allowedRoles?: ('super-admin' | 'admin' | 'user')[];

  /** Search keywords for fuzzy matching */
  keywords?: string[];

  /** Whether command is currently enabled */
  enabled?: boolean;

  /** Whether command is hidden from command palette (Story 1.3) */
  hidden?: boolean;

  /** Priority for sorting (higher = shown first) */
  priority?: number;

  /** Whether to close palette after execution */
  closeOnExecute?: boolean;

  /** Optional badge text or count */
  badge?: string | number;

  /** Optional badge color */
  badgeColor?: string;
}

/**
 * Filters for querying commands (Story 1.3)
 * Supports multiple filter values per type for flexible querying
 */
export interface CommandFilters {
  /** Filter by one or more categories */
  categories?: CommandCategory[];

  /** Filter by one or more context types */
  contexts?: CommandContext['type'][];

  /** Filter by one or more user roles */
  roles?: ('super-admin' | 'admin' | 'user')[];

  /** Search query for fuzzy matching */
  query?: string;

  /** Only return enabled commands */
  enabledOnly?: boolean;

  // Deprecated singular fields for backward compatibility
  /** @deprecated Use categories[] instead */
  category?: CommandCategory;
  /** @deprecated Use contexts[] instead */
  context?: CommandContext['type'];
  /** @deprecated Use roles[] instead */
  role?: 'super-admin' | 'admin' | 'user';
}

/**
 * Registry event types
 */
export type RegistryEventType =
  | 'command:registered'
  | 'command:unregistered'
  | 'command:executing' // Story 1.4: Emitted before command execution
  | 'command:executed'
  | 'command:executionFailed'
  | 'command:error' // Story 1.4: Alias for executionFailed
  | 'context:pushed'
  | 'context:popped'
  | 'context:cleared' // @deprecated Use 'contexts:cleared' instead
  | 'contexts:cleared'
  | 'registry:cleared';

/**
 * Registry event payload
 */
export interface RegistryEvent {
  type: RegistryEventType;
  timestamp: number;
  data: unknown;
}

/**
 * Event listener function signature
 */
export type RegistryEventListener = (event: RegistryEvent) => void;
