/**
 * Keyboard Utility Functions
 * Story 4.5: Platform detection and keyboard shortcut formatting
 */

/**
 * Detects the current operating system platform
 * @returns 'mac' | 'windows' | 'linux' | 'unknown'
 */
export function detectPlatform(): 'mac' | 'windows' | 'linux' | 'unknown' {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'unknown';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  }
  if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows';
  }
  if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
}

/**
 * Returns platform-specific modifier key label
 * @returns '⌘' for Mac, 'Ctrl' for Windows/Linux
 */
export function getModifierKeyLabel(): string {
  const platform = detectPlatform();
  return platform === 'mac' ? '⌘' : 'Ctrl';
}

/**
 * Formats keyboard shortcut for display with platform-specific modifier
 * @param key - The key to display (e.g., 'K')
 * @returns Formatted shortcut string (e.g., '⌘K' or 'Ctrl+K')
 *
 * @example
 * formatShortcut('K') // Returns '⌘K' on Mac, 'Ctrl+K' on Windows/Linux
 */
export function formatShortcut(key: string): string {
  const modifier = getModifierKeyLabel();
  const separator = modifier === '⌘' ? '' : '+';
  return `${modifier}${separator}${key.toUpperCase()}`;
}

/**
 * Checks if a keyboard event matches the command palette shortcut (Cmd+K / Ctrl+K)
 * @param event - Keyboard event to check
 * @returns true if event is Cmd+K (Mac) or Ctrl+K (Windows/Linux)
 */
export function isCommandPaletteShortcut(event: KeyboardEvent): boolean {
  const platform = detectPlatform();
  const key = event.key.toLowerCase();

  if (platform === 'mac') {
    return event.metaKey && key === 'k' && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  // Windows/Linux/Unknown
  return event.ctrlKey && key === 'k' && !event.metaKey && !event.shiftKey && !event.altKey;
}
