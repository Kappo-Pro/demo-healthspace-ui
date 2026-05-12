/**
 * useExecuteCommand Hook Tests
 * Story 2.5: Unit tests for useExecuteCommand hook
 */

import { renderHook } from '@testing-library/react';
import { useExecuteCommand } from '../useExecuteCommand';
import { CommandPaletteProvider } from '@contexts/CommandPaletteContext';
import { commandRegistry } from '../../lib/commands/CommandRegistry';
import { Command } from '../../lib/commands/types';
import React from 'react';

describe('useExecuteCommand', () => {
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
    it('should return a function for executing commands', () => {
      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      expect(typeof result.current).toBe('function');
    });

    it('should execute command via registry', async () => {
      const mockHandler = jest.fn();
      const testCommand: Command = {
        id: 'test-execute-1',
        label: 'Test Execute 1',
        category: 'test',
        availableInContexts: ['global'],
        handler: mockHandler
      };

      commandRegistry.register([testCommand]);

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      await executeCommand('test-execute-1');

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle successful command execution', async () => {
      const mockHandler = jest.fn().mockResolvedValue('success');
      const testCommand: Command = {
        id: 'test-success-1',
        label: 'Test Success 1',
        category: 'test',
        availableInContexts: ['global'],
        handler: mockHandler
      };

      commandRegistry.register([testCommand]);

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      await expect(executeCommand('test-success-1')).resolves.not.toThrow();
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle failed command execution', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Command failed'));
      const testCommand: Command = {
        id: 'test-fail-1',
        label: 'Test Fail 1',
        category: 'test',
        availableInContexts: ['global'],
        handler: mockHandler
      };

      commandRegistry.register([testCommand]);

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      // Should re-throw error for caller to handle
      await expect(executeCommand('test-fail-1')).rejects.toThrow('Command failed');
    });

    it('should log error to console on failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockHandler = jest.fn().mockRejectedValue(new Error('Test error'));
      const testCommand: Command = {
        id: 'test-log-error-1',
        label: 'Test Log Error 1',
        category: 'test',
        availableInContexts: ['global'],
        handler: mockHandler
      };

      commandRegistry.register([testCommand]);

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      try {
        await executeCommand('test-log-error-1');
      } catch (error) {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Command execution failed: test-log-error-1',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-existent command', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      await expect(executeCommand('non-existent-command')).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Memoization', () => {
    it('should return stable function reference (memoized)', () => {
      const { result, rerender } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const firstReference = result.current;

      // Force re-render
      rerender();

      const secondReference = result.current;

      // Function reference should be stable (memoized with useCallback)
      expect(firstReference).toBe(secondReference);
    });

    it('should maintain memoization across multiple renders', () => {
      const { result, rerender } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const references = [result.current];

      // Re-render multiple times
      for (let i = 0; i < 5; i++) {
        rerender();
        references.push(result.current);
      }

      // All references should be the same
      const allSame = references.every(ref => ref === references[0]);
      expect(allSame).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should execute multiple commands sequentially', async () => {
      const handler1 = jest.fn().mockResolvedValue('result1');
      const handler2 = jest.fn().mockResolvedValue('result2');
      const handler3 = jest.fn().mockResolvedValue('result3');

      const commands: Command[] = [
        {
          id: 'bulk-1',
          label: 'Bulk 1',
          category: 'test',
          availableInContexts: ['global'],
          handler: handler1
        },
        {
          id: 'bulk-2',
          label: 'Bulk 2',
          category: 'test',
          availableInContexts: ['global'],
          handler: handler2
        },
        {
          id: 'bulk-3',
          label: 'Bulk 3',
          category: 'test',
          availableInContexts: ['global'],
          handler: handler3
        }
      ];

      commandRegistry.register(commands);

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      // Execute all commands sequentially
      await executeCommand('bulk-1');
      await executeCommand('bulk-2');
      await executeCommand('bulk-3');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('should work with async command handlers', async () => {
      let asyncValue = 'initial';

      const asyncHandler = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        asyncValue = 'modified';
      });

      const testCommand: Command = {
        id: 'async-cmd',
        label: 'Async Command',
        category: 'test',
        availableInContexts: ['global'],
        handler: asyncHandler
      };

      commandRegistry.register([testCommand]);

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      expect(asyncValue).toBe('initial');

      await executeCommand('async-cmd');

      expect(asyncValue).toBe('modified');
      expect(asyncHandler).toHaveBeenCalled();
    });

    it('should allow caller to handle errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Custom error'));
      const testCommand: Command = {
        id: 'custom-error-cmd',
        label: 'Custom Error Command',
        category: 'test',
        availableInContexts: ['global'],
        handler: mockHandler
      };

      commandRegistry.register([testCommand]);

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      let caughtError: Error | null = null;

      try {
        await executeCommand('custom-error-cmd');
      } catch (error) {
        caughtError = error as Error;
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError?.message).toBe('Custom error');
    });

    it('should execute command with inline async handler', async () => {
      let called = false;

      const { result } = renderHook(() => useExecuteCommand(), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const executeCommand = result.current;

      const testCommand: Command = {
        id: 'inline-cmd',
        label: 'Inline Command',
        category: 'test',
        availableInContexts: ['global'],
        handler: async () => {
          called = true;
        }
      };

      commandRegistry.register([testCommand]);

      await executeCommand('inline-cmd');

      expect(called).toBe(true);
    });
  });
});
