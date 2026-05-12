/**
 * CommandRegistry Integration Test Suite
 *
 * Tests integration between CommandRegistry and its dependencies:
 * - EventEmitter integration for lifecycle events
 * - Context stack integration with command filtering
 * - Multi-component workflows (register → filter → execute)
 * - Error propagation across components
 *
 * These tests validate that components work together correctly,
 * catching integration issues that unit tests might miss.
 */

import { CommandRegistry } from '../CommandRegistry';
import { Command, CommandExecutionContext } from '../types';
import { GLOBAL_CONTEXT } from '../constants';

describe('CommandRegistry - Integration Tests', () => {
  let registry: CommandRegistry;
  let eventLog: Array<{ event: string; data?: unknown }>;

  beforeEach(async () => {
    registry = CommandRegistry.getInstance();
    registry.clear();
    eventLog = [];

    // Wait for rate limit window to clear
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Set up event listeners for integration tracking
    registry.on('commandRegistered', (data) => {
      eventLog.push({ event: 'commandRegistered', data });
    });
    registry.on('commandUnregistered', (data) => {
      eventLog.push({ event: 'commandUnregistered', data });
    });
    registry.on('commandExecuted', (data) => {
      eventLog.push({ event: 'commandExecuted', data });
    });
    registry.on('commandExecutionFailed', (data) => {
      eventLog.push({ event: 'commandExecutionFailed', data });
    });
    registry.on('contextChanged', (data) => {
      eventLog.push({ event: 'contextChanged', data });
    });
  });

  afterEach(() => {
    registry.removeAllListeners();
    registry.clear();
  });

  describe('EventEmitter Integration', () => {
    it('should emit events in correct sequence for full command lifecycle', async () => {
      // Register command
      const command: Command = {
        id: 'lifecycle-cmd',
        label: 'Lifecycle Command',
        category: 'test',
        keywords: ['lifecycle'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {
          return { success: true };
        },
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      };

      registry.register([command]);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Execute command
      await registry.execute('lifecycle-cmd', {});
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Unregister command
      registry.unregister(['lifecycle-cmd']);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify event sequence
      expect(eventLog.length).toBe(3);
      expect(eventLog[0].event).toBe('commandRegistered');
      expect(eventLog[1].event).toBe('commandExecuted');
      expect(eventLog[2].event).toBe('commandUnregistered');
    });

    it('should emit commandExecutionFailed when handler throws error', async () => {
      const errorCommand: Command = {
        id: 'error-cmd',
        label: 'Error Command',
        category: 'test',
        keywords: ['error'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {
          throw new Error('Intentional test error');
        },
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      };

      registry.register([errorCommand]);
      eventLog = []; // Clear registration event

      // Execute should fail
      await expect(registry.execute('error-cmd', {})).rejects.toThrow('Intentional test error');
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify failure event emitted
      const failureEvents = eventLog.filter((log) => log.event === 'commandExecutionFailed');
      expect(failureEvents.length).toBe(1);
      expect((failureEvents[0].data as { commandId: string }).commandId).toBe('error-cmd');
    });

    it('should emit contextChanged when context stack is modified', async () => {
      registry.pushContext('user-123');
      await new Promise((resolve) => setTimeout(resolve, 10));

      registry.pushContext('program-456');
      await new Promise((resolve) => setTimeout(resolve, 10));

      registry.popContext();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify context change events
      const contextEvents = eventLog.filter((log) => log.event === 'contextChanged');
      expect(contextEvents.length).toBe(3);
      expect((contextEvents[0].data as { contexts: string[] }).contexts).toEqual([
        GLOBAL_CONTEXT,
        'user-123',
      ]);
      expect((contextEvents[1].data as { contexts: string[] }).contexts).toEqual([
        GLOBAL_CONTEXT,
        'user-123',
        'program-456',
      ]);
      expect((contextEvents[2].data as { contexts: string[] }).contexts).toEqual([
        GLOBAL_CONTEXT,
        'user-123',
      ]);
    });

    it('should emit multiple commandRegistered events for batch registration', async () => {
      const commands: Command[] = Array.from({ length: 5 }, (_, i) => ({
        id: `batch-${i}`,
        label: `Batch ${i}`,
        category: 'test',
        keywords: ['batch'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {},
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      registry.register(commands);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify 5 registration events emitted
      const registrationEvents = eventLog.filter((log) => log.event === 'commandRegistered');
      expect(registrationEvents.length).toBe(5);
    });
  });

  describe('Context Stack + Command Filtering Integration', () => {
    it('should filter commands correctly based on active context stack', () => {
      const commands: Command[] = [
        {
          id: 'global-cmd',
          label: 'Global Command',
          category: 'test',
          keywords: ['global'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'user-cmd',
          label: 'User Command',
          category: 'test',
          keywords: ['user'],
          priority: 50,
          availableInContexts: ['user-123'],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'program-cmd',
          label: 'Program Command',
          category: 'test',
          keywords: ['program'],
          priority: 50,
          availableInContexts: ['program-456'],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
      ];

      registry.register(commands);

      // Initially: Only global context
      let visibleCommands = registry.getCommands();
      expect(visibleCommands.length).toBe(1);
      expect(visibleCommands[0].id).toBe('global-cmd');

      // Push user context
      registry.pushContext('user-123');
      visibleCommands = registry.getCommands();
      expect(visibleCommands.length).toBe(2);
      expect(visibleCommands.map((cmd) => cmd.id).sort()).toEqual(['global-cmd', 'user-cmd']);

      // Push program context
      registry.pushContext('program-456');
      visibleCommands = registry.getCommands();
      expect(visibleCommands.length).toBe(3);
      expect(visibleCommands.map((cmd) => cmd.id).sort()).toEqual([
        'global-cmd',
        'program-cmd',
        'user-cmd',
      ]);

      // Pop program context
      registry.popContext();
      visibleCommands = registry.getCommands();
      expect(visibleCommands.length).toBe(2);
      expect(visibleCommands.map((cmd) => cmd.id).sort()).toEqual(['global-cmd', 'user-cmd']);
    });

    it('should combine context filtering with category filtering', () => {
      const commands: Command[] = [
        {
          id: 'nav-global',
          label: 'Nav Global',
          category: 'navigation',
          keywords: ['nav'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'nav-user',
          label: 'Nav User',
          category: 'navigation',
          keywords: ['nav'],
          priority: 50,
          availableInContexts: ['user-123'],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'action-user',
          label: 'Action User',
          category: 'action',
          keywords: ['action'],
          priority: 50,
          availableInContexts: ['user-123'],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
      ];

      registry.register(commands);

      // Push user context
      registry.pushContext('user-123');

      // Filter by category within user context
      const navCommands = registry.getCommands({ category: 'navigation' });
      expect(navCommands.length).toBe(2);
      expect(navCommands.map((cmd) => cmd.id).sort()).toEqual(['nav-global', 'nav-user']);

      const actionCommands = registry.getCommands({ category: 'action' });
      expect(actionCommands.length).toBe(1);
      expect(actionCommands[0].id).toBe('action-user');
    });

    it('should respect context hierarchy when executing commands', async () => {
      const executionTracker: string[] = [];

      const commands: Command[] = [
        {
          id: 'base-cmd',
          label: 'Base Command',
          category: 'test',
          keywords: ['base'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {
            executionTracker.push('base');
          },
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'user-cmd',
          label: 'User Command',
          category: 'test',
          keywords: ['user'],
          priority: 50,
          availableInContexts: ['user-123'],
          handler: async () => {
            executionTracker.push('user');
          },
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
      ];

      registry.register(commands);

      // Execute base command (always available)
      await registry.execute('base-cmd', {});
      expect(executionTracker).toEqual(['base']);

      // Try to execute user command without context (should fail)
      await expect(registry.execute('user-cmd', {})).rejects.toThrow('Command not found or not available in current context');

      // Push user context and execute user command
      registry.pushContext('user-123');
      await registry.execute('user-cmd', {});
      expect(executionTracker).toEqual(['base', 'user']);
    });
  });

  describe('Multi-Component Workflow Integration', () => {
    it('should support complete workflow: register → search → filter → execute', async () => {
      // Setup: Register diverse commands
      const commands: Command[] = [
        {
          id: 'nav-home',
          label: 'Navigate to Home',
          category: 'navigation',
          keywords: ['home', 'dashboard', 'main'],
          priority: 90,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async (ctx: CommandExecutionContext) => {
            return { navigatedTo: 'home', userId: ctx.userId };
          },
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: { route: '/home' },
        },
        {
          id: 'user-profile',
          label: 'View User Profile',
          category: 'user',
          keywords: ['profile', 'user', 'settings'],
          priority: 80,
          availableInContexts: ['user-123'],
          handler: async (ctx: CommandExecutionContext) => {
            return { action: 'view-profile', userId: ctx.userId };
          },
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: { requiresAuth: true },
        },
        {
          id: 'user-logout',
          label: 'Logout',
          category: 'user',
          keywords: ['logout', 'signout', 'exit'],
          priority: 70,
          availableInContexts: ['user-123'],
          handler: async () => {
            return { action: 'logout', success: true };
          },
          enabled: true,
          visible: true,
          requiresConfirmation: true,
          metadata: { requiresAuth: true },
        },
      ];

      registry.register(commands);

      // Step 1: Search for navigation commands
      const navCommands = registry.getCommands({ category: 'navigation' });
      expect(navCommands.length).toBe(1);
      expect(navCommands[0].id).toBe('nav-home');

      // Step 2: Execute navigation command
      const navResult = await registry.execute('nav-home', { userId: 'user-123' });
      expect(navResult).toEqual({ navigatedTo: 'home', userId: 'user-123' });

      // Step 3: Push user context
      registry.pushContext('user-123');

      // Step 4: Filter user commands
      const userCommands = registry.getCommands({ category: 'user' });
      expect(userCommands.length).toBe(2);
      expect(userCommands.map((cmd) => cmd.id).sort()).toEqual(['user-logout', 'user-profile']);

      // Step 5: Execute user command
      const profileResult = await registry.execute('user-profile', { userId: 'user-123' });
      expect(profileResult).toEqual({ action: 'view-profile', userId: 'user-123' });

      // Verify events were emitted throughout workflow
      const executionEvents = eventLog.filter((log) => log.event === 'commandExecuted');
      expect(executionEvents.length).toBe(2);
    });

    it('should handle error propagation across integrated components', async () => {
      const failingCommand: Command = {
        id: 'failing-cmd',
        label: 'Failing Command',
        category: 'test',
        keywords: ['fail'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {
          throw new Error('Component failure');
        },
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      };

      registry.register([failingCommand]);

      // Execution should fail
      await expect(registry.execute('failing-cmd', {})).rejects.toThrow('Component failure');

      // Event should be emitted
      const failureEvents = eventLog.filter((log) => log.event === 'commandExecutionFailed');
      expect(failureEvents.length).toBe(1);

      // Command should still be registered
      const cmd = registry.getCommand('failing-cmd');
      expect(cmd).toBeDefined();
      expect(cmd?.enabled).toBe(true);
    });

    it('should maintain consistency when operations are interleaved', async () => {
      const commands: Command[] = Array.from({ length: 10 }, (_, i) => ({
        id: `interleaved-${i}`,
        label: `Interleaved ${i}`,
        category: 'test',
        keywords: ['interleaved'],
        priority: i * 10,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => ({ index: i }),
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      // Register in two batches with operations in between
      registry.register(commands.slice(0, 5));

      // Perform operations
      registry.pushContext('test-context');
      const firstBatch = registry.getCommands();
      expect(firstBatch.length).toBe(5);

      // Register second batch
      registry.register(commands.slice(5, 10));

      // Verify consistency
      const allCommands = registry.getCommands();
      expect(allCommands.length).toBe(10);

      // Execute from both batches
      const result1 = await registry.execute('interleaved-2', {});
      const result2 = await registry.execute('interleaved-7', {});

      expect(result1).toEqual({ index: 2 });
      expect(result2).toEqual({ index: 7 });
    });
  });

  describe('State Synchronization Integration', () => {
    it('should synchronize state across registry operations', async () => {
      const commands: Command[] = [
        {
          id: 'sync-1',
          label: 'Sync 1',
          category: 'test',
          keywords: ['sync'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'sync-2',
          label: 'Sync 2',
          category: 'test',
          keywords: ['sync'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: false, // Disabled initially
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
      ];

      registry.register(commands);

      // Verify initial state
      let stats = registry.getStats();
      expect(stats.totalCommands).toBe(2);
      expect(stats.enabledCommands).toBe(1);

      // Update command state
      const updatedCommand: Command = { ...commands[1], enabled: true };
      registry.register([updatedCommand]); // Re-register with updated state

      // Verify updated state
      stats = registry.getStats();
      expect(stats.enabledCommands).toBe(2);

      // Verify getCommands reflects updated state
      const allCommands = registry.getCommands();
      expect(allCommands.every((cmd) => cmd.enabled)).toBe(true);
    });

    it('should maintain consistent state after complex context operations', () => {
      const commands: Command[] = [
        {
          id: 'ctx-1',
          label: 'Context 1',
          category: 'test',
          keywords: ['ctx'],
          priority: 50,
          availableInContexts: ['context-a', 'context-b'],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'ctx-2',
          label: 'Context 2',
          category: 'test',
          keywords: ['ctx'],
          priority: 50,
          availableInContexts: ['context-b', 'context-c'],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'ctx-3',
          label: 'Context 3',
          category: 'test',
          keywords: ['ctx'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
      ];

      registry.register(commands);

      // Complex context stack operations
      registry.pushContext('context-a');
      expect(registry.getCommands().length).toBe(2); // ctx-1, ctx-3

      registry.pushContext('context-b');
      expect(registry.getCommands().length).toBe(3); // ctx-1, ctx-2, ctx-3

      registry.popContext(); // Remove context-b
      expect(registry.getCommands().length).toBe(2); // ctx-1, ctx-3

      registry.pushContext('context-c');
      expect(registry.getCommands().length).toBe(2); // ctx-2, ctx-3

      registry.clearContext();
      expect(registry.getCommands().length).toBe(1); // ctx-3 only (global)
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from handler errors without affecting registry state', async () => {
      const commands: Command[] = [
        {
          id: 'stable-cmd',
          label: 'Stable Command',
          category: 'test',
          keywords: ['stable'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => ({ status: 'ok' }),
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
        {
          id: 'error-cmd',
          label: 'Error Command',
          category: 'test',
          keywords: ['error'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {
            throw new Error('Handler error');
          },
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
      ];

      registry.register(commands);

      // Execute stable command
      const result1 = await registry.execute('stable-cmd', {});
      expect(result1).toEqual({ status: 'ok' });

      // Execute error command (should fail)
      await expect(registry.execute('error-cmd', {})).rejects.toThrow('Handler error');

      // Execute stable command again (should still work)
      const result2 = await registry.execute('stable-cmd', {});
      expect(result2).toEqual({ status: 'ok' });

      // Verify registry state is intact
      expect(registry.getCommands().length).toBe(2);
      const stats = registry.getStats();
      expect(stats.totalCommands).toBe(2);
      expect(stats.enabledCommands).toBe(2);
    });

    it('should handle registration errors without corrupting existing commands', async () => {
      const validCommands: Command[] = [
        {
          id: 'valid-1',
          label: 'Valid 1',
          category: 'test',
          keywords: ['valid'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        },
      ];

      registry.register(validCommands);
      expect(registry.getCommands().length).toBe(1);

      // Try to register duplicate command (should fail or overwrite)
      const duplicateCommand: Command = { ...validCommands[0], label: 'Valid 1 Updated' };
      registry.register([duplicateCommand]);

      // Registry should still function
      const commands = registry.getCommands();
      expect(commands.length).toBe(1);
      expect(commands[0].label).toBe('Valid 1 Updated'); // Should be updated
    });
  });
});
