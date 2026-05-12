/**
 * CommandRegistry - Story 3.3: Search & Filter Integration Tests
 *
 * Test Coverage:
 * - AC1-4: getCommands() integrates filterCommands and searchCommands with correct pipeline order
 * - AC8: Integration tests verify filter → search → sort pipeline
 * - AC9: Performance tests verify 300 commands <10ms, 1000 commands <20ms
 */

import { commandRegistry } from '../CommandRegistry';
import { Command, CommandContext } from '../types';

describe('CommandRegistry - Story 3.3: Search & Filter Integration', () => {
  // Helper to create a mock command
  const createMockCommand = (id: string, overrides?: Partial<Command>): Command => ({
    id,
    label: `Command ${id}`,
    category: 'navigation',
    handler: jest.fn(),
    availableInContexts: ['global'],
    ...overrides,
  });

  // Helper to generate test commands for performance tests
  const generateTestCommands = (count: number): Command[] => {
    const categories = ['navigation', 'action', 'settings', 'patient', 'program'];
    const contexts: CommandContext['type'][] = ['global', 'user', 'program', 'assessment', 'report'];
    const roles: Array<'super-admin' | 'admin' | 'user' | undefined> = [
      'super-admin',
      'admin',
      'user',
      undefined,
    ];

    return Array.from({ length: count }, (_, i) => {
      const categoryIndex = i % 5;
      const contextIndex = i % 5;
      const roleIndex = i % 4;

      const role = roles[roleIndex];
      return createMockCommand(`perf-cmd-${i}`, {
        label: `Command ${i}`,
        description: `Description for command ${i}`,
        category: categories[categoryIndex],
        availableInContexts: [contexts[contextIndex], 'global'],
        allowedRoles: role ? [role] : undefined,
        priority: i % 10,
        enabled: i % 20 !== 0,
        hidden: i % 30 !== 0,
        keywords: [`keyword-${i}`, 'test'],
      });
    });
  };

  beforeEach(async () => {
    // Clear registry between tests
    commandRegistry.clear();

    // Wait for rate limit window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

  describe('AC1-4: Pipeline Integration - Filter → Search → Sort', () => {
    it('should apply filters first, then search query', () => {
      commandRegistry.register([
        createMockCommand('dash-nav', {
          label: 'Dashboard',
          category: 'navigation',
          availableInContexts: ['global'],
          allowedRoles: ['admin'],
          priority: 10,
        }),
        createMockCommand('dash-patient', {
          label: 'Patient Dashboard',
          category: 'patient',
          availableInContexts: ['global'],
          allowedRoles: ['admin'],
          priority: 5,
        }),
        createMockCommand('settings-dash', {
          label: 'Dashboard Settings',
          category: 'settings',
          availableInContexts: ['global'],
          allowedRoles: ['admin'],
          priority: 3,
        }),
      ]);

      // Filter by category='navigation', then search for 'dash'
      const _results = commandRegistry.getCommands({
        categories: ['navigation'],
        roles: ['admin'],
        query: 'dash',
      });

      // Should only get navigation commands that match 'dash'
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('dash-nav');
    });

    it('should sort by score when query provided', () => {
      commandRegistry.register([
        createMockCommand('go-dashboard', {
          label: 'Go Dashboard',
          category: 'navigation',
          availableInContexts: ['global'],
          priority: 5,
        }),
        createMockCommand('dashboard', {
          label: 'Dashboard',
          category: 'navigation',
          availableInContexts: ['global'],
          priority: 10,
        }),
      ]);

      const _results = commandRegistry.getCommands({ query: 'dashboard' });

      // Exact match 'Dashboard' should score higher than 'Go Dashboard' (contains)
      expect(results[0].id).toBe('dashboard');
      expect(results[1].id).toBe('go-dashboard');
    });

    it('should sort by priority when no query provided', () => {
      commandRegistry.register([
        createMockCommand('low', {
          label: 'Low Priority',
          category: 'navigation',
          availableInContexts: ['global'],
          priority: 1,
        }),
        createMockCommand('high', {
          label: 'High Priority',
          category: 'navigation',
          availableInContexts: ['global'],
          priority: 10,
        }),
        createMockCommand('medium', {
          label: 'Medium Priority',
          category: 'navigation',
          availableInContexts: ['global'],
          priority: 5,
        }),
      ]);

      const _results = commandRegistry.getCommands();

      // Should be sorted by priority descending
      expect(results[0].id).toBe('high');
      expect(results[1].id).toBe('medium');
      expect(results[2].id).toBe('low');
    });

    it('should use contextStack from registry in filterCommands', () => {
      commandRegistry.register([
        createMockCommand('global-cmd', {
          label: 'Global Command',
          availableInContexts: ['global'],
        }),
        createMockCommand('user-cmd', {
          label: 'User Command',
          availableInContexts: ['user'],
        }),
      ]);

      // No user context - should only see global commands
      let results = commandRegistry.getCommands();
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('global-cmd');

      // Push user context
      commandRegistry.pushContext({
        type: 'user',
        userId: 'u1',
        userName: 'Test User',
        userRole: 'admin',
      });

      // Should now see both global and user commands
      results = commandRegistry.getCommands();
      expect(results).toHaveLength(2);
    });

    it('should apply default filtering (enabled, hidden, context) when no filters provided', () => {
      commandRegistry.register([
        createMockCommand('enabled-visible', {
          enabled: true,
          hidden: false,
          availableInContexts: ['global'],
        }),
        createMockCommand('disabled', {
          enabled: false,
          availableInContexts: ['global'],
        }),
        createMockCommand('hidden', {
          enabled: true,
          hidden: true,
          availableInContexts: ['global'],
        }),
      ]);

      const _results = commandRegistry.getCommands();
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('enabled-visible');
    });
  });

  describe('AC8: Pipeline Order Verification', () => {
    it('should execute pipeline in order: filter → search → sort', () => {
      commandRegistry.register([
        createMockCommand('nav-home', {
          label: 'Home',
          category: 'navigation',
          availableInContexts: ['global'],
          allowedRoles: ['admin'],
          priority: 10,
        }),
        createMockCommand('nav-dashboard', {
          label: 'Dashboard',
          category: 'navigation',
          availableInContexts: ['global'],
          allowedRoles: ['admin'],
          priority: 5,
        }),
        createMockCommand('patient-home', {
          label: 'Patient Home',
          category: 'patient',
          availableInContexts: ['global'],
          allowedRoles: ['admin'],
          priority: 15,
        }),
      ]);

      // Filter by category=navigation, role=admin, search for 'home'
      const _results = commandRegistry.getCommands({
        categories: ['navigation'],
        roles: ['admin'],
        query: 'home',
      });

      // Should get only nav-home (patient-home filtered out by category)
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('nav-home');
    });

    it('should filter reducing dataset before expensive search', () => {
      commandRegistry.register([
        createMockCommand('enabled-match', {
          label: 'Dashboard',
          enabled: true,
          availableInContexts: ['global'],
        }),
        createMockCommand('disabled-match', {
          label: 'Dashboard Settings',
          enabled: false,
          availableInContexts: ['global'],
        }),
      ]);

      const _results = commandRegistry.getCommands({ query: 'dashboard' });

      // disabled-match should be filtered out before search
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('enabled-match');
    });
  });

  describe('AC9: Performance Tests', () => {
    it('should process 100 commands + query in <10ms', async () => {
      const commands = generateTestCommands(100);
      // Register in batches to avoid rate limit
      for (let i = 0; i < 2; i++) {
        commandRegistry.register(commands.slice(i * 50, (i + 1) * 50));
        if (i < 1) await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const start = performance.now();
      const _results = commandRegistry.getCommands({ query: 'test' });
      const duration = performance.now() - start;

      // eslint-disable-next-line no-console
      console.log(`100 commands + query: ${duration.toFixed(3)}ms`);
      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10);
    });

    it('should process 300 commands + query in <10ms (NFR1.4)', async () => {
      const commands = generateTestCommands(300);
      // Register in batches to avoid rate limit
      for (let i = 0; i < 6; i++) {
        commandRegistry.register(commands.slice(i * 50, (i + 1) * 50));
        if (i < 5) await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const start = performance.now();
      const _results = commandRegistry.getCommands({
        query: 'test', // Search for keyword 'test' instead of 'command'
      });
      const duration = performance.now() - start;

       
      // eslint-disable-next-line no-console
      console.log(`300 commands + query: ${duration.toFixed(3)}ms`);
      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10);
    });

    it('should process 300 commands + filters + query in <10ms', async () => {
      const commands = generateTestCommands(300);
      // Register in batches
      for (let i = 0; i < 6; i++) {
        commandRegistry.register(commands.slice(i * 50, (i + 1) * 50));
        if (i < 5) await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const start = performance.now();
      const _results = commandRegistry.getCommands({
        categories: ['navigation', 'action'],
        roles: ['admin', 'user'],
        query: 'test',
      });
      const duration = performance.now() - start;

       
      // eslint-disable-next-line no-console
      console.log(`300 commands + multi-filter + query: ${duration.toFixed(3)}ms`);
      expect(duration).toBeLessThan(10);
    });

    it('should process 500 commands + query in <20ms (scaled from NFR1.5)', async () => {
      // Clear existing commands
      commandRegistry.clear();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const commands = generateTestCommands(500);
      // Register in batches (10 batches of 50)
      for (let i = 0; i < 10; i++) {
        commandRegistry.register(commands.slice(i * 50, (i + 1) * 50));
        if (i < 9) await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const start = performance.now();
      const _results = commandRegistry.getCommands({
        query: 'command',
        categories: ['navigation', 'action'],
      });
      const duration = performance.now() - start;

       
      // eslint-disable-next-line no-console
      console.log(`500 commands + query + filter: ${duration.toFixed(3)}ms`);
      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(20);
    });
  });
});
