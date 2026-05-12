/**
 * Keyboard Utility Functions Tests
 * Story 4.5: Tests for platform detection and keyboard shortcut utilities
 */

import {
  detectPlatform,
  getModifierKeyLabel,
  formatShortcut,
  isCommandPaletteShortcut,
} from '../keyboard';

describe('keyboard utilities', () => {
  describe('detectPlatform', () => {
    const originalNavigator = window.navigator;
    const _originalPlatform = window.navigator.platform;

    afterEach(() => {
      // Restore original navigator
      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });

    it('detects Mac platform from userAgent', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
        },
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('mac');
    });

    it('detects Windows platform', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          platform: 'Win32',
        },
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('windows');
    });

    it('detects Linux platform', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
          platform: 'Linux x86_64',
        },
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('linux');
    });

    it('returns unknown for unrecognized platform', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Unknown UA',
          platform: 'Unknown',
        },
        writable: true,
        configurable: true,
      });

      expect(detectPlatform()).toBe('unknown');
    });
  });

  describe('getModifierKeyLabel', () => {
    it('returns ⌘ for Mac platform', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
        },
        writable: true,
        configurable: true,
      });

      expect(getModifierKeyLabel()).toBe('⌘');
    });

    it('returns Ctrl for Windows platform', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          platform: 'Win32',
        },
        writable: true,
        configurable: true,
      });

      expect(getModifierKeyLabel()).toBe('Ctrl');
    });

    it('returns Ctrl for Linux platform', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
          platform: 'Linux x86_64',
        },
        writable: true,
        configurable: true,
      });

      expect(getModifierKeyLabel()).toBe('Ctrl');
    });
  });

  describe('formatShortcut', () => {
    it('formats shortcut for Mac (⌘K)', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
        },
        writable: true,
        configurable: true,
      });

      expect(formatShortcut('K')).toBe('⌘K');
      expect(formatShortcut('k')).toBe('⌘K');
    });

    it('formats shortcut for Windows (Ctrl+K)', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          platform: 'Win32',
        },
        writable: true,
        configurable: true,
      });

      expect(formatShortcut('K')).toBe('Ctrl+K');
      expect(formatShortcut('k')).toBe('Ctrl+K');
    });
  });

  describe('isCommandPaletteShortcut', () => {
    it('returns true for Cmd+K on Mac', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
        },
        writable: true,
        configurable: true,
      });

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      });

      expect(isCommandPaletteShortcut(event)).toBe(true);
    });

    it('returns true for Ctrl+K on Windows', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          platform: 'Win32',
        },
        writable: true,
        configurable: true,
      });

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      });

      expect(isCommandPaletteShortcut(event)).toBe(true);
    });

    it('returns false for K without modifier', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      });

      expect(isCommandPaletteShortcut(event)).toBe(false);
    });

    it('returns false for Cmd+K with Shift', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
        },
        writable: true,
        configurable: true,
      });

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        ctrlKey: false,
        shiftKey: true,
        altKey: false,
      });

      expect(isCommandPaletteShortcut(event)).toBe(false);
    });

    it('returns false for different key with Cmd', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
        },
        writable: true,
        configurable: true,
      });

      const event = new KeyboardEvent('keydown', {
        key: 'j',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      });

      expect(isCommandPaletteShortcut(event)).toBe(false);
    });
  });
});
