import { renderHook, act } from '@testing-library/react';
import { useCollapsibleState } from '../useCollapsibleState';

describe('useCollapsibleState', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Basic functionality', () => {
    it('should return initial expanded state from defaultExpanded', () => {
      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      const [isExpanded] = result.current;
      expect(isExpanded).toBe(true);
    });

    it('should return initial collapsed state when defaultExpanded is false', () => {
      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: false })
      );

      const [isExpanded] = result.current;
      expect(isExpanded).toBe(false);
    });

    it('should toggle state when toggle function is called', () => {
      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      const [initialState] = result.current;
      expect(initialState).toBe(true);

      act(() => {
        result.current[1](); // Call toggle function
      });

      const [newState] = result.current;
      expect(newState).toBe(false);
    });

    it('should toggle state multiple times', () => {
      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1](); // Toggle to false
      });
      expect(result.current[0]).toBe(false);

      act(() => {
        result.current[1](); // Toggle to true
      });
      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1](); // Toggle to false again
      });
      expect(result.current[0]).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('should save state to localStorage when toggled', () => {
      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      act(() => {
        result.current[1](); // Toggle to false
      });

      const saved = localStorage.getItem('dashboard-section-state-test-section');
      expect(saved).toBe('false');
    });

    it('should restore state from localStorage on mount', () => {
      // Pre-populate localStorage with collapsed state
      localStorage.setItem('dashboard-section-state-test-section', 'false');

      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      // Should restore from localStorage (false), not use defaultExpanded (true)
      const [isExpanded] = result.current;
      expect(isExpanded).toBe(false);
    });

    it('should restore expanded state from localStorage', () => {
      localStorage.setItem('dashboard-section-state-test-section', 'true');

      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: false })
      );

      // Should restore from localStorage (true), not use defaultExpanded (false)
      const [isExpanded] = result.current;
      expect(isExpanded).toBe(true);
    });

    it('should persist state across component remounts', () => {
      // First mount
      const { result: result1, unmount } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      act(() => {
        result1.current[1](); // Toggle to false
      });

      expect(result1.current[0]).toBe(false);

      // Unmount component
      unmount();

      // Second mount - should restore state
      const { result: result2 } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      expect(result2.current[0]).toBe(false); // Restored from localStorage
    });

    it('should use unique storage keys for different sectionIds', () => {
      const { result: result1 } = renderHook(() =>
        useCollapsibleState({ sectionId: 'section-1', defaultExpanded: true })
      );

      const { result: result2 } = renderHook(() =>
        useCollapsibleState({ sectionId: 'section-2', defaultExpanded: false })
      );

      act(() => {
        result1.current[1](); // Toggle section-1 to false
      });

      expect(result1.current[0]).toBe(false);
      expect(result2.current[0]).toBe(false); // section-2 still false

      const saved1 = localStorage.getItem('dashboard-section-state-section-1');
      const saved2 = localStorage.getItem('dashboard-section-state-section-2');

      expect(saved1).toBe('false');
      expect(saved2).toBe('false');
    });

    it('should update localStorage on every state change', () => {
      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      // Initial state saved
      expect(localStorage.getItem('dashboard-section-state-test-section')).toBe('true');

      act(() => {
        result.current[1](); // Toggle to false
      });
      expect(localStorage.getItem('dashboard-section-state-test-section')).toBe('false');

      act(() => {
        result.current[1](); // Toggle to true
      });
      expect(localStorage.getItem('dashboard-section-state-test-section')).toBe('true');
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage.getItem errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const getItemSpy = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('localStorage is disabled');
        });

      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      // Should fall back to defaultExpanded
      expect(result.current[0]).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalled();

      getItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage.setItem errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const setItemSpy = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        });

      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      // Component should still work even if saving fails
      act(() => {
        result.current[1](); // Toggle
      });

      expect(result.current[0]).toBe(false); // State still toggles
      expect(consoleWarnSpy).toHaveBeenCalled();

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle QuotaExceededError specifically', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const setItemSpy = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          const error = new DOMException('QuotaExceededError');
          Object.defineProperty(error, 'name', { value: 'QuotaExceededError' });
          throw error;
        });

      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      act(() => {
        result.current[1]();
      });

      // Should log warning (handled by usePersistedState)
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result.current[0]).toBe(false); // State still works

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should continue working when localStorage is disabled', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Simulate disabled localStorage
      const getItemSpy = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('localStorage is disabled');
        });

      const setItemSpy = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('localStorage is disabled');
        });

      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1]();
      });

      expect(result.current[0]).toBe(false);

      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('API contract', () => {
    it('should return a tuple with [boolean, function]', () => {
      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBe(2);
      expect(typeof result.current[0]).toBe('boolean');
      expect(typeof result.current[1]).toBe('function');
    });

    it('should have stable toggle function reference', () => {
      const { result, rerender } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section', defaultExpanded: true })
      );

      const toggleFn1 = result.current[1];

      rerender();

      const toggleFn2 = result.current[1];

      expect(toggleFn1).toBe(toggleFn2); // Should be the same function reference
    });

    it('should default to true when defaultExpanded is not provided', () => {
      const { result } = renderHook(() =>
        useCollapsibleState({ sectionId: 'test-section' })
      );

      expect(result.current[0]).toBe(true);
    });
  });

  describe('Storage key format', () => {
    it('should use correct storage key format', () => {
      renderHook(() =>
        useCollapsibleState({ sectionId: 'my-programs', defaultExpanded: true })
      );

      const key = 'dashboard-section-state-my-programs';
      expect(localStorage.getItem(key)).toBe('true');
    });

    it('should handle kebab-case sectionIds', () => {
      renderHook(() =>
        useCollapsibleState({
          sectionId: 'recent-activity-stream',
          defaultExpanded: false,
        })
      );

      const key = 'dashboard-section-state-recent-activity-stream';
      expect(localStorage.getItem(key)).toBe('false');
    });
  });
});
