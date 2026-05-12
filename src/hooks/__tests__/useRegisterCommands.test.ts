/**
 * useRegisterCommands Hook Tests
 * Story 2.5: Unit tests for useRegisterCommands hook
 */

import { renderHook } from '@testing-library/react';
import { useRegisterCommands } from '../useRegisterCommands';
import { CommandPaletteProvider } from '@contexts/CommandPaletteContext';
import { commandRegistry } from '../../lib/commands/CommandRegistry';
import { Command } from '../../lib/commands/types';
import React from 'react';

describe('useRegisterCommands', () => {
  // Clean up registry before and after each test
  beforeEach(() => {
    commandRegistry.clear();
    commandRegistry.removeAllListeners();
  });

  afterEach(() => {
    commandRegistry.clear();
    commandRegistry.removeAllListeners();
  });

  describe('Registration Lifecycle', () => {
    it('should register commands on mount', () => {
      const testCommands: Command[] = [
        {
          id: 'test-mount-1',
          label: 'Test Mount 1',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      renderHook(() => useRegisterCommands(testCommands), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const registeredCommands = commandRegistry.getCommands();
      expect(registeredCommands.some(cmd => cmd.id === 'test-mount-1')).toBe(true);
    });

    it('should unregister commands on unmount', () => {
      const testCommands: Command[] = [
        {
          id: 'test-unmount-1',
          label: 'Test Unmount 1',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      const { unmount } = renderHook(() => useRegisterCommands(testCommands), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      // Verify command is registered
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-unmount-1')).toBe(true);

      // Unmount and verify cleanup
      unmount();

      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-unmount-1')).toBe(false);
    });

    it('should register multiple commands at once', () => {
      const testCommands: Command[] = [
        {
          id: 'test-multi-1',
          label: 'Test Multi 1',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        },
        {
          id: 'test-multi-2',
          label: 'Test Multi 2',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        },
        {
          id: 'test-multi-3',
          label: 'Test Multi 3',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      renderHook(() => useRegisterCommands(testCommands), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const registeredCommands = commandRegistry.getCommands();
      expect(registeredCommands.some(cmd => cmd.id === 'test-multi-1')).toBe(true);
      expect(registeredCommands.some(cmd => cmd.id === 'test-multi-2')).toBe(true);
      expect(registeredCommands.some(cmd => cmd.id === 'test-multi-3')).toBe(true);
    });
  });

  describe('Re-registration on Changes', () => {
    it('should re-register when commands array changes', () => {
      const initialCommands: Command[] = [
        {
          id: 'test-change-1',
          label: 'Test Change 1',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      const { rerender } = renderHook(
        ({ commands }) => useRegisterCommands(commands),
        {
          initialProps: { commands: initialCommands },
          wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
        }
      );

      // Verify initial command is registered
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-change-1')).toBe(true);

      const newCommands: Command[] = [
        {
          id: 'test-change-2',
          label: 'Test Change 2',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      // Re-render with new commands
      rerender({ commands: newCommands });

      // Verify old command is unregistered and new command is registered
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-change-1')).toBe(false);
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-change-2')).toBe(true);
    });

    it('should cleanup old commands before registering new ones', () => {
      const initialCommands: Command[] = [
        {
          id: 'test-cleanup-1',
          label: 'Test Cleanup 1',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      const { rerender } = renderHook(
        ({ commands }) => useRegisterCommands(commands),
        {
          initialProps: { commands: initialCommands },
          wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
        }
      );

      const newCommands: Command[] = [
        {
          id: 'test-cleanup-2',
          label: 'Test Cleanup 2',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      rerender({ commands: newCommands });

      const registeredCommands = commandRegistry.getCommands();

      // Old command should be cleaned up
      expect(registeredCommands.some(cmd => cmd.id === 'test-cleanup-1')).toBe(false);

      // New command should be registered
      expect(registeredCommands.some(cmd => cmd.id === 'test-cleanup-2')).toBe(true);

      // Should not have duplicates
      const allTestCommands = registeredCommands.filter(cmd => cmd.id.startsWith('test-cleanup-'));
      expect(allTestCommands.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty commands array', () => {
      const emptyCommands: Command[] = [];

      renderHook(() => useRegisterCommands(emptyCommands), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle commands array reference changes with same content', () => {
      const command = {
        id: 'test-ref-1',
        label: 'Test Ref 1',
        category: 'test' as const,
        availableInContexts: ['global' as const],
        handler: jest.fn()
      };

      const firstArray = [command];

      const { rerender } = renderHook(
        ({ commands }) => useRegisterCommands(commands),
        {
          initialProps: { commands: firstArray },
          wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
        }
      );

      // Create new array with same command
      const secondArray = [command];

      rerender({ commands: secondArray });

      // Command should still be registered (re-registered with same content)
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-ref-1')).toBe(true);
    });

    it('should not leak commands across multiple hook instances', () => {
      const commands1: Command[] = [
        {
          id: 'test-leak-1',
          label: 'Test Leak 1',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      const commands2: Command[] = [
        {
          id: 'test-leak-2',
          label: 'Test Leak 2',
          category: 'test',
          availableInContexts: ['global'],
          handler: jest.fn()
        }
      ];

      const { unmount: unmount1 } = renderHook(() => useRegisterCommands(commands1), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const { unmount: unmount2 } = renderHook(() => useRegisterCommands(commands2), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      // Both should be registered
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-leak-1')).toBe(true);
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-leak-2')).toBe(true);

      // Unmount first hook
      unmount1();

      // First command should be unregistered, second still registered
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-leak-1')).toBe(false);
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-leak-2')).toBe(true);

      // Unmount second hook
      unmount2();

      // Both should be unregistered
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-leak-1')).toBe(false);
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'test-leak-2')).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should work with dynamically generated commands', () => {
      const userId = '123';
      const userName = 'John Doe';

      const dynamicCommands: Command[] = [
        {
          id: `user-profile-${userId}`,
          label: `View ${userName}'s Profile`,
          category: 'navigation',
          availableInContexts: ['user'],
          handler: jest.fn()
        }
      ];

      renderHook(() => useRegisterCommands(dynamicCommands), {
        wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
      });

      const registeredCommands = commandRegistry.getCommands();
      expect(registeredCommands.some(cmd => cmd.id === 'user-profile-123')).toBe(true);
      expect(registeredCommands.some(cmd => cmd.label === "View John Doe's Profile")).toBe(true);
    });

    it('should allow conditionally registering commands', () => {
      const isEnabled = true;

      const conditionalCommands: Command[] = isEnabled
        ? [
            {
              id: 'conditional-cmd',
              label: 'Conditional Command',
              category: 'test',
              availableInContexts: ['global'],
              handler: jest.fn()
            }
          ]
        : [];

      const { rerender } = renderHook(
        ({ commands }) => useRegisterCommands(commands),
        {
          initialProps: { commands: conditionalCommands },
          wrapper: ({ children }) => React.createElement(CommandPaletteProvider, {}, children)
        }
      );

      // Command should be registered when enabled
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'conditional-cmd')).toBe(true);

      // Disable and re-render with empty array
      const disabledCommands: Command[] = [];
      rerender({ commands: disabledCommands });

      // Command should be unregistered when disabled
      expect(commandRegistry.getCommands().some(cmd => cmd.id === 'conditional-cmd')).toBe(false);
    });
  });
});
