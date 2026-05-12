/**
 * useKeyboardNavigation Hook
 *
 * Provides keyboard shortcut handling for navigation and actions.
 * Supports global shortcuts like Cmd+K, navigation shortcuts like 'g h',
 * and context-specific shortcuts.
 */

import { useEffect, useCallback, useRef } from 'react';
import { KeyboardShortcut } from '../components/layouts/AppLayout/types';

interface UseKeyboardNavigationProps {
  /** Array of keyboard shortcuts to register */
  shortcuts: KeyboardShortcut[];

  /** Enable/disable keyboard navigation */
  enabled?: boolean;

  /** Scope for shortcuts (global vs local) */
  scope?: 'global' | 'local';
}

/**
 * Check if the key combination matches
 */
function matchesShortcut(event: KeyboardEvent, keys: string): boolean {
  const parts = keys.toLowerCase().split('+');
  const key = parts[parts.length - 1];

  const requiresCmd = parts.includes('cmd') || parts.includes('meta');
  const requiresCtrl = parts.includes('ctrl');
  const requiresShift = parts.includes('shift');
  const requiresAlt = parts.includes('alt');

  const hasCmd = event.metaKey || event.ctrlKey; // Mac uses meta, Windows uses ctrl
  const hasShift = event.shiftKey;
  const hasAlt = event.altKey;

  // Check modifiers
  if (requiresCmd && !hasCmd) return false;
  if (requiresCtrl && !event.ctrlKey) return false;
  if (requiresShift && !hasShift) return false;
  if (requiresAlt && !hasAlt) return false;

  // Check key
  const eventKey = event.key.toLowerCase();
  return eventKey === key || event.code.toLowerCase() === key.toLowerCase();
}

/**
 * Check if we should ignore keyboard events
 */
function shouldIgnoreEvent(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;

  // Handle synthetic events that don't have a proper target
  if (!target || !target.tagName) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  // Ignore events from input elements
  if (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  ) {
    return true;
  }

  return false;
}

/**
 * useKeyboardNavigation hook
 */
export function useKeyboardNavigation({
  shortcuts,
  enabled = true,
  scope = 'global',
}: UseKeyboardNavigationProps): void {
  const shortcutsRef = useRef(shortcuts);
  const sequenceRef = useRef<string[]>([]);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout>();

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (shouldIgnoreEvent(event)) return;

      const key = event.key.toLowerCase();

      // Handle Escape key specially
      if (key === 'escape') {
        const escapeShortcut = shortcutsRef.current.find(s => s.keys === 'Escape');
        if (escapeShortcut && escapeShortcut.enabled !== false) {
          event.preventDefault();
          escapeShortcut.handler();
        }
        return;
      }

      // Try to match single-key or modified shortcuts first
      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        if (matchesShortcut(event, shortcut.keys)) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }

      // Handle sequential shortcuts (like 'g h' for go home)
      // Only for alphabetic keys without modifiers
      if (
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        key.length === 1 &&
        /^[a-z]$/.test(key)
      ) {
        // Add to sequence
        sequenceRef.current.push(key);

        // Reset sequence after timeout
        clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = setTimeout(() => {
          sequenceRef.current = [];
        }, 1000);

        // Check if sequence matches any shortcut
        const sequence = sequenceRef.current.join(' ');
        for (const shortcut of shortcutsRef.current) {
          if (shortcut.enabled === false) continue;

          if (shortcut.keys === sequence) {
            event.preventDefault();
            shortcut.handler();
            sequenceRef.current = [];
            clearTimeout(sequenceTimeoutRef.current);
            return;
          }
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled || scope !== 'global') return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(sequenceTimeoutRef.current);
    };
  }, [enabled, scope, handleKeyDown]);
}

/**
 * Helper hook for registering a single shortcut
 */
export function useKeyboardShortcut(
  keys: string,
  handler: () => void,
  enabled = true
): void {
  useKeyboardNavigation({
    shortcuts: [{ keys, description: '', handler, enabled }],
    enabled,
  });
}
