/**
 * useGlobalKeyboardShortcut Hook
 * Story 4.5: Global keyboard shortcut listener for command palette (Cmd+K / Ctrl+K)
 *
 * Registers document-level keyboard event listener with proper cleanup
 * Prevents default browser behavior for the shortcut
 */

import { useEffect } from 'react';
import { isCommandPaletteShortcut } from '../utils/keyboard';

/**
 * useGlobalKeyboardShortcut - Hook to register global Cmd+K / Ctrl+K shortcut
 *
 * @param onTrigger - Callback function to invoke when shortcut is pressed
 * @param enabled - Whether the shortcut listener is active (default: true)
 *
 * @example
 * useGlobalKeyboardShortcut(() => {
 *   setCommandPaletteOpen(true);
 * });
 */
export function useGlobalKeyboardShortcut(
  onTrigger: () => void,
  enabled = true
): void {
  useEffect(() => {
    // Skip if disabled or SSR
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    /**
     * Handler for keydown events
     * Checks if event matches Cmd+K / Ctrl+K and triggers callback
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isCommandPaletteShortcut(event)) {
        event.preventDefault(); // Prevent browser default (e.g., Chrome address bar)
        event.stopPropagation(); // Prevent event bubbling
        onTrigger();
      }
    };

    // Register global listener on document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup listener on unmount or dependency change
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTrigger, enabled]);
}
