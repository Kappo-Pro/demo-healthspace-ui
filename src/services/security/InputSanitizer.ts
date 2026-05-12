/**
 * InputSanitizer Service
 * Story 6.1: XSS Prevention with DOMPurify
 *
 * Provides defense-in-depth protection against XSS attacks by sanitizing
 * all user-provided content before rendering in the command palette.
 *
 * Security Features:
 * - Removes script tags and event handlers
 * - Blocks javascript: protocol in links
 * - Whitelist approach (allow safe tags only)
 * - Singleton pattern for consistent configuration
 *
 * @see https://github.com/cure53/DOMPurify
 */

import DOMPurify from 'dompurify';
import type { PresetCommand, UserAction } from '@atoms/CommandPalette/types';

/**
 * Input sanitization service for XSS prevention
 * Uses DOMPurify to sanitize all user-provided content
 */
class InputSanitizerService {
  private purify: typeof DOMPurify;

  constructor() {
    this.purify = DOMPurify;

    // Configure whitelist approach - allow safe tags only
    this.purify.setConfig({
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href'],
      KEEP_CONTENT: true, // Preserve text inside removed tags
      RETURN_TRUSTED_TYPE: false, // Return string
    });

    // Add hook to remove javascript: protocol from links
    this.purify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A') {
        const href = node.getAttribute('href');
        if (href && href.toLowerCase().startsWith('javascript:')) {
          node.removeAttribute('href');
        }
      }
    });
  }

  /**
   * Sanitize a string input
   * Removes all potentially dangerous HTML/JS while preserving safe formatting
   *
   * @param input - Raw string input
   * @returns Sanitized string safe for rendering
   *
   * @example
   * ```typescript
   * InputSanitizer.sanitize('<script>alert("xss")</script>Hello');
   * // Returns: 'Hello'
   *
   * InputSanitizer.sanitize('<b>Bold</b> <a href="https://safe.com">Link</a>');
   * // Returns: '<b>Bold</b> <a href="https://safe.com">Link</a>'
   * ```
   */
  sanitize(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return this.purify.sanitize(input);
  }

  /**
   * Sanitize all text fields in a PresetCommand
   * Applies sanitization to label, description, and keywords
   *
   * @param command - Raw command object
   * @returns New command with sanitized fields
   *
   * @example
   * ```typescript
   * const command: PresetCommand = {
   *   id: 'test',
   *   label: '<script>xss</script>Dashboard',
   *   description: 'Go to <b>dashboard</b>',
   *   category: 'navigation',
   *   keywords: ['<script>evil</script>dash'],
   *   handler: () => {},
   * };
   *
   * const sanitized = InputSanitizer.sanitizeCommand(command);
   * // sanitized.label === 'Dashboard'
   * // sanitized.description === 'Go to <b>dashboard</b>'
   * // sanitized.keywords === ['dash']
   * ```
   */
  sanitizeCommand(command: PresetCommand): PresetCommand {
    return {
      ...command,
      label: this.sanitize(command.label),
      description: command.description
        ? this.sanitize(command.description)
        : undefined,
      keywords: command.keywords?.map((k) => this.sanitize(k)),
    };
  }

  /**
   * Sanitize an array of commands
   * Applies sanitization to all commands in batch
   *
   * @param commands - Array of commands
   * @returns Array with sanitized commands
   */
  sanitizeCommands(commands: PresetCommand[]): PresetCommand[] {
    return commands.map((cmd) => this.sanitizeCommand(cmd));
  }

  /**
   * Sanitize all text fields in a UserAction
   * Applies sanitization to label and description
   *
   * @param action - Raw action object
   * @returns New action with sanitized fields
   */
  sanitizeAction(action: UserAction): UserAction {
    return {
      ...action,
      label: this.sanitize(action.label),
      description: this.sanitize(action.description),
    };
  }

  /**
   * Sanitize an array of user actions
   * Applies sanitization to all actions in batch
   *
   * @param actions - Array of user actions
   * @returns Array with sanitized actions
   */
  sanitizeActions(actions: UserAction[]): UserAction[] {
    return actions.map((action) => this.sanitizeAction(action));
  }
}

// Export singleton instance
export const InputSanitizer = new InputSanitizerService();
