/**
 * useCommandRegistry Hook Tests
 * Story 2.5: Unit tests for useCommandRegistry hook
 */

import { renderHook } from '@testing-library/react';
import { useCommandRegistry } from '../useCommandRegistry';
import { CommandPaletteProvider } from '@contexts/CommandPaletteContext';
import { commandRegistry } from '../../lib/commands/CommandRegistry';
import React from 'react';

describe('useCommandRegistry', () => {
  // Clean up registry before and after each test
  beforeEach(() => {
    commandRegistry.clear();
    commandRegistry.removeAllListeners();
  });

  afterEach(() => {
    commandRegistry.clear();
    commandRegistry.removeAllListeners();
  });

  describe('Hook Functionality', () => {
    it('should return command registry instance', () => {
      const { result } = renderHook(() => useCommandRegistry(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      expect(result.current).toBeDefined();
      expect(result.current).toBeTruthy();
    });

    it('should return registry with expected methods', () => {
      const { result } = renderHook(() => useCommandRegistry(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const registry = result.current;

      // Verify all expected methods exist
      expect(typeof registry.register).toBe('function');
      expect(typeof registry.unregister).toBe('function');
      expect(typeof registry.execute).toBe('function');
      expect(typeof registry.getCommands).toBe('function');
      expect(typeof registry.getCommand).toBe('function');
      expect(typeof registry.getContextStack).toBe('function');
      expect(typeof registry.pushContext).toBe('function');
      expect(typeof registry.popContext).toBe('function');
      expect(typeof registry.clear).toBe('function');
    });

    it('should return the same registry instance across renders', () => {
      const { result, rerender } = renderHook(() => useCommandRegistry(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const firstRegistry = result.current;

      // Force a re-render
      rerender();

      const secondRegistry = result.current;

      // Registry instance should be stable (same reference)
      expect(firstRegistry).toBe(secondRegistry);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when used outside CommandPaletteProvider', () => {
      // Suppress console error for this test
      const originalError = console.error;
      console.error = jest.fn();

      const { result } = renderHook(() => useCommandRegistry());

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('useCommandPalette must be used within CommandPaletteProvider');

      // Restore console.error
      console.error = originalError;
    });

    it('should have descriptive error message', () => {
      // Suppress console error for this test
      const originalError = console.error;
      console.error = jest.fn();

      const { result } = renderHook(() => useCommandRegistry());

      expect(result.error?.message).toMatch(/CommandPaletteProvider/i);

      // Restore console.error
      console.error = originalError;
    });
  });

  describe('Registry Operations', () => {
    it('should allow registering commands through registry', () => {
      const { result } = renderHook(() => useCommandRegistry(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const registry = result.current;

      const testCommand = {
        id: 'test-command',
        label: 'Test Command',
        category: 'test' as const,
        availableInContexts: ['global' as const],
        handler: jest.fn()
      };

      // Register command
      registry.register([testCommand]);

      // Verify command was registered
      const commands = registry.getCommands();
      expect(commands.some(cmd => cmd.id === 'test-command')).toBe(true);

      // Cleanup
      registry.unregister('test-command');
    });

    it('should allow querying commands with filters', () => {
      const { result } = renderHook(() => useCommandRegistry(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const registry = result.current;

      const testCommand = {
        id: 'test-query-command',
        label: 'Test Query Command',
        category: 'test' as const,
        availableInContexts: ['global' as const],
        handler: jest.fn()
      };

      registry.register([testCommand]);

      // Query by context
      const globalCommands = registry.getCommands({ contexts: ['global'] });
      expect(globalCommands.some(cmd => cmd.id === 'test-query-command')).toBe(true);

      // Query by search term
      const searchResults = registry.getCommands({ query: 'query' });
      expect(searchResults.some(cmd => cmd.id === 'test-query-command')).toBe(true);

      // Cleanup
      registry.unregister('test-query-command');
    });

    it('should provide access to context stack', () => {
      const { result } = renderHook(() => useCommandRegistry(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const registry = result.current;
      const contextStack = registry.getContextStack();

      // Stack should at least have global context
      expect(Array.isArray(contextStack)).toBe(true);
      expect(contextStack.length).toBeGreaterThanOrEqual(1);
      expect(contextStack[0].type).toBe('global');
    });
  });
});
