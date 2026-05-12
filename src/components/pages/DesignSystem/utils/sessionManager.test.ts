/**
 * Unit tests for Session Storage Manager
 */

import sessionManager, { SessionManager } from './sessionManager';
import { DesignSystemState, DEFAULT_DESIGN_SYSTEM_STATE } from '../types';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global sessionStorage with mock
Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('SessionManager', () => {
  beforeEach(() => {
    // Ensure we're using the mock
    mockSessionStorage.clear();
    // Double-check the global mock is in place
    expect(sessionStorage.getItem('test-key-should-be-null')).toBeNull();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getStorageKey', () => {
    it('should return correct storage key', () => {
      expect(sessionManager.getStorageKey()).toBe(
        'vitalflow-design-system-state',
      );
    });
  });

  describe('saveState', () => {
    it('should save state to sessionStorage', () => {
      const state: DesignSystemState = {
        colors: { primary: '#007bff' },
        darkMode: true,
      };

      const result = sessionManager.saveState(state);

      expect(result).toBe(true);
      expect(mockSessionStorage.getItem('vitalflow-design-system-state')).toBeTruthy();
    });

    it('should include version and timestamp', () => {
      const state: DesignSystemState = {
        colors: { primary: '#007bff' },
      };

      sessionManager.saveState(state);

      const stored = mockSessionStorage.getItem('vitalflow-design-system-state');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored ?? '{}');

      expect(parsed.version).toBe('1.0');
      expect(parsed.timestamp).toBeGreaterThan(0);
      expect(parsed.state).toEqual(state);
    });

    it('should return false on error', () => {
      // Force error by making setItem throw
      jest.spyOn(mockSessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = sessionManager.saveState({});

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadState', () => {
    it('should load saved state', () => {
      const state: DesignSystemState = {
        colors: { primary: '#007bff', secondary: '#6c757d' },
        darkMode: true,
        typography: { fontFamily: 'Inter' },
      };

      sessionManager.saveState(state);
      const loaded = sessionManager.loadState();

      expect(loaded).toEqual(state);
    });

    it('should properly convert modifiedTokens array back to Set', () => {
      const state: DesignSystemState = {
        ...DEFAULT_DESIGN_SYSTEM_STATE,
        modifiedTokens: new Set(['--color-purple-500', '--brand-primary']),
        customTokens: {
          '--color-purple-500': '#ff0000',
          '--brand-primary': '#00ff00',
        },
      };

      // Save state (converts Set to Array)
      sessionManager.saveState(state);

      // Load state (should convert Array back to Set)
      const loaded = sessionManager.loadState();

      // Verify modifiedTokens is a Set
      expect(loaded.modifiedTokens).toBeInstanceOf(Set);
      expect(loaded.modifiedTokens.size).toBe(2);
      expect(loaded.modifiedTokens.has('--color-purple-500')).toBe(true);
      expect(loaded.modifiedTokens.has('--brand-primary')).toBe(true);
    });

    it('should return default state when no data stored', () => {
      const loaded = sessionManager.loadState();

      expect(loaded).toMatchObject({
        colors: {},
        typography: {},
        spacing: {},
        borderRadius: {},
        shadows: {},
        darkMode: false,
        customCSS: '',
      });
    });

    it('should return default state on invalid JSON', () => {
      mockSessionStorage.setItem(
        'vitalflow-design-system-state',
        'invalid json{',
      );

      const loaded = sessionManager.loadState();

      expect(loaded).toMatchObject({
        colors: {},
        typography: {},
        spacing: {},
        borderRadius: {},
        shadows: {},
        darkMode: false,
        customCSS: '',
      });
      expect(console.error).toHaveBeenCalled();
    });

    it('should return default state on invalid structure', () => {
      mockSessionStorage.setItem(
        'vitalflow-design-system-state',
        JSON.stringify({ invalid: 'structure' }),
      );

      const loaded = sessionManager.loadState();

      expect(loaded).toMatchObject({
        colors: {},
        typography: {},
        spacing: {},
        borderRadius: {},
        shadows: {},
        darkMode: false,
        customCSS: '',
      });
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return default state on incompatible version', () => {
      mockSessionStorage.setItem(
        'vitalflow-design-system-state',
        JSON.stringify({
          version: '2.0',
          timestamp: Date.now(),
          state: { colors: { primary: '#007bff' } },
        }),
      );

      const loaded = sessionManager.loadState();

      expect(loaded).toMatchObject({
        colors: {},
        typography: {},
        spacing: {},
        borderRadius: {},
        shadows: {},
        darkMode: false,
        customCSS: '',
      });
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('clearState', () => {
    it('should remove state from sessionStorage', () => {
      sessionManager.saveState({ darkMode: true });
      expect(mockSessionStorage.getItem('vitalflow-design-system-state')).toBeTruthy();

      const result = sessionManager.clearState();

      expect(result).toBe(true);
      expect(mockSessionStorage.getItem('vitalflow-design-system-state')).toBeNull();
    });

    it('should return false on error', () => {
      jest.spyOn(mockSessionStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = sessionManager.clearState();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getMetadata', () => {
    it('should return metadata without loading full state', () => {
      const state: DesignSystemState = {
        colors: { primary: '#007bff' },
      };

      sessionManager.saveState(state);
      const metadata = sessionManager.getMetadata();

      expect(metadata).not.toBeNull();
      expect(metadata?.version).toBe('1.0');
      expect(metadata?.timestamp).toBeGreaterThan(0);
    });

    it('should return null when no state stored', () => {
      const metadata = sessionManager.getMetadata();

      expect(metadata).toBeNull();
    });

    it('should return null on invalid data', () => {
      mockSessionStorage.setItem(
        'vitalflow-design-system-state',
        'invalid json',
      );

      const metadata = sessionManager.getMetadata();

      expect(metadata).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('hasStoredState', () => {
    it('should return true when valid state exists', () => {
      sessionManager.saveState({ darkMode: true });

      expect(sessionManager.hasStoredState()).toBe(true);
    });

    it('should return false when no state exists', () => {
      expect(sessionManager.hasStoredState()).toBe(false);
    });

    it('should return false when invalid state exists', () => {
      mockSessionStorage.setItem(
        'vitalflow-design-system-state',
        'invalid json',
      );

      expect(sessionManager.hasStoredState()).toBe(false);
    });
  });

  describe('Singleton behavior', () => {
    it('should export singleton instance', () => {
      expect(sessionManager).toBeInstanceOf(SessionManager);
    });

    it('should maintain state across imports', () => {
      sessionManager.saveState({ darkMode: true });

      // Simulate another module importing the same instance
      const loaded = sessionManager.loadState();

      expect(loaded.darkMode).toBe(true);
    });
  });
});
