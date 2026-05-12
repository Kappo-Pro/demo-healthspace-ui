/**
 * @file Unit and Performance Tests for Command Search Engine
 * @module lib/commands/__tests__/search.test
 */

import { scoreCommand, searchCommands, searchCommandsOptimized } from '../search';
import { Command } from '../types';

describe('scoreCommand', () => {
  // Clear localStorage before each test to ensure clean state
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Label Matching', () => {
    it('scores exact label match as 100+ points (AC2)', () => {
      const cmd: Command = {
        id: 'test-1',
        label: 'Dashboard',
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'Dashboard');
      expect(score).toBeGreaterThanOrEqual(100);
    });

    it('scores label starts-with match as 80+ points (AC3)', () => {
      const cmd: Command = {
        id: 'test-2',
        label: 'Dashboard',
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'Dash');
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThan(100); // Should not reach exact match score
    });

    it('scores label contains match as 50+ points (AC4)', () => {
      const cmd: Command = {
        id: 'test-3',
        label: 'Dashboard',
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'board');
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThan(80); // Should not reach starts-with score
    });

    it('performs case-insensitive matching', () => {
      const cmd: Command = {
        id: 'test-4',
        label: 'dashboard',
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const scoreUpper = scoreCommand(cmd, 'DASHBOARD');
      const scoreLower = scoreCommand(cmd, 'dashboard');
      const scoreMixed = scoreCommand(cmd, 'DashBoard');

      expect(scoreUpper).toBe(scoreLower);
      expect(scoreUpper).toBe(scoreMixed);
      expect(scoreUpper).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Description Matching', () => {
    it('adds 30 points for description match (AC5)', () => {
      const cmd: Command = {
        id: 'test-5',
        label: 'Settings',
        description: 'Open user settings panel',
        category: 'settings',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const scoreWithDesc = scoreCommand(cmd, 'panel');
      const cmdNoDesc: Command = {
        ...cmd,
        description: undefined,
      };
      const scoreWithoutDesc = scoreCommand(cmdNoDesc, 'panel');

      expect(scoreWithDesc).toBe(scoreWithoutDesc + 30);
    });

    it('handles undefined description safely', () => {
      const cmd: Command = {
        id: 'test-6',
        label: 'Dashboard',
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      expect(() => scoreCommand(cmd, 'test')).not.toThrow();
    });
  });

  describe('Keyword Matching', () => {
    it('adds 40 points per keyword match (AC6)', () => {
      const cmd: Command = {
        id: 'test-7',
        label: 'Settings',
        keywords: ['config', 'preferences'],
        category: 'settings',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'config');
      // Exact keyword match: 40 (contains) + 20 (exact bonus) = 60
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('adds 60 points for exact keyword match (40 + 20 bonus) (AC6)', () => {
      const cmd: Command = {
        id: 'test-8',
        label: 'Settings',
        keywords: ['config'],
        category: 'settings',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'config');
      expect(score).toBeGreaterThanOrEqual(60); // 40 + 20 bonus
    });

    it('adds 40 points for partial keyword match', () => {
      const cmd: Command = {
        id: 'test-9',
        label: 'Settings',
        keywords: ['configuration'],
        category: 'settings',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'config');
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThan(60); // Should not get exact bonus
    });

    it('handles undefined keywords safely', () => {
      const cmd: Command = {
        id: 'test-10',
        label: 'Dashboard',
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      expect(() => scoreCommand(cmd, 'test')).not.toThrow();
    });

    it('scores multiple keyword matches cumulatively', () => {
      const cmd: Command = {
        id: 'test-11',
        label: 'Settings',
        keywords: ['config', 'configure', 'configuration'],
        category: 'settings',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'config');
      // 'config' exact match: 40 + 20 = 60
      // 'configure' contains: 40
      // 'configuration' contains: 40
      // Total from keywords: 140+
      expect(score).toBeGreaterThanOrEqual(140);
    });
  });

  describe('Recent Command Boost', () => {
    it('adds 20 points for recently used command (AC7)', () => {
      // Use different query to test recency boost without exact match confusion
      const cmd: Command = {
        id: 'boost-test',
        label: 'Boost Test',
        category: 'action',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      // Set localStorage before scoring
      localStorage.setItem(
        'command-palette-recent',
        JSON.stringify(['boost-test'])
      );

      const score = scoreCommand(cmd, 'Boost Test');
      // Exact match (100) + recent boost (20) = 120
      expect(score).toBe(120);
    });

    it('does not boost non-recent commands', () => {
      localStorage.setItem(
        'command-palette-recent',
        JSON.stringify(['other-cmd'])
      );

      const cmd: Command = {
        id: 'non-recent-cmd',
        label: 'Command',
        category: 'action',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'Command');
      expect(score).toBe(100); // 100 exact, no recent boost
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage disabled');
      });

      const cmd: Command = {
        id: 'test-cmd',
        label: 'Command',
        category: 'action',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      expect(() => scoreCommand(cmd, 'Command')).not.toThrow();
      const score = scoreCommand(cmd, 'Command');
      expect(score).toBe(100); // No crash, no recent boost

      jest.restoreAllMocks();
    });

    it('handles invalid JSON in localStorage', () => {
      localStorage.setItem('command-palette-recent', 'invalid-json{]');

      const cmd: Command = {
        id: 'test-cmd',
        label: 'Command',
        category: 'action',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      expect(() => scoreCommand(cmd, 'Command')).not.toThrow();
      const score = scoreCommand(cmd, 'Command');
      expect(score).toBe(100); // Falls back gracefully
    });
  });

  describe('Priority Boost', () => {
    it('adds priority value to score (AC8)', () => {
      const cmd: Command = {
        id: 'test-12',
        label: 'Dashboard',
        priority: 15,
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'Dashboard');
      expect(score).toBe(115); // 100 exact + 15 priority
    });

    it('handles undefined priority (defaults to 0)', () => {
      const cmd: Command = {
        id: 'test-13',
        label: 'Dashboard',
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'Dashboard');
      expect(score).toBe(100); // 100 exact + 0 priority
    });
  });

  describe('Multiple Factors Scoring', () => {
    it('combines multiple scoring factors correctly', () => {
      localStorage.setItem(
        'command-palette-recent',
        JSON.stringify(['multi-factor-cmd'])
      );

      const cmd: Command = {
        id: 'multi-factor-cmd',
        label: 'Dashboard',
        description: 'View main dashboard panel',
        keywords: ['home'],
        priority: 10,
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'board');
      // 50 (contains) + 30 (description contains) + 20 (recent) + 10 (priority) = 110
      expect(score).toBe(110);
    });

    it('returns 0 for complete non-match', () => {
      const cmd: Command = {
        id: 'test-14',
        label: 'Dashboard',
        description: 'Main view',
        keywords: ['home'],
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'xyz123');
      expect(score).toBe(0);
    });

    it('returns priority-only for non-matching command with priority', () => {
      const cmd: Command = {
        id: 'test-15',
        label: 'Dashboard',
        priority: 25,
        category: 'navigation',
        availableInContexts: ['global'],
        handler: jest.fn(),
      };

      const score = scoreCommand(cmd, 'xyz123');
      expect(score).toBe(25); // Only priority, no matches
    });
  });
});

describe('searchCommands', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createMockCommand = (
    id: string,
    label: string,
    options?: Partial<Command>
  ): Command => ({
    id,
    label,
    category: 'navigation',
    availableInContexts: ['global'],
    handler: jest.fn(),
    ...options,
  });

  describe('Empty Query Handling', () => {
    it('returns all commands unchanged for empty query (AC9)', () => {
      const commands: Command[] = [
        createMockCommand('1', 'Dashboard'),
        createMockCommand('2', 'Settings'),
        createMockCommand('3', 'Profile'),
      ];

      const results = searchCommands('', commands);
      expect(results).toEqual(commands);
      expect(results.length).toBe(3);
    });

    it('returns all commands unchanged for whitespace-only query', () => {
      const commands: Command[] = [
        createMockCommand('1', 'Dashboard'),
        createMockCommand('2', 'Settings'),
      ];

      const results = searchCommands('   ', commands);
      expect(results).toEqual(commands);
    });
  });

  describe('Sorting by Score', () => {
    it('returns commands sorted by score (highest first) (AC9)', () => {
      const commands: Command[] = [
        createMockCommand('1', 'Go to Dashboard'), // Contains: 50
        createMockCommand('2', 'Dashboard'), // Exact: 100
        createMockCommand('3', 'Dashboards List'), // Starts-with: 80
      ];

      const results = searchCommands('Dashboard', commands);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe('2'); // Exact match first (100)
      expect(results[1].id).toBe('3'); // Starts-with second (80)
      expect(results[2].id).toBe('1'); // Contains last (50)
    });

    it('ranks exact match higher than starts-with', () => {
      const commands: Command[] = [
        createMockCommand('1', 'Dashboard Settings'),
        createMockCommand('2', 'Dashboard'),
      ];

      const results = searchCommands('Dashboard', commands);

      expect(results[0].id).toBe('2'); // Exact match
      expect(results[1].id).toBe('1'); // Starts-with
    });
  });

  describe('Filtering Non-Matches', () => {
    it('filters out commands with score = 0 (AC9)', () => {
      const commands: Command[] = [
        createMockCommand('1', 'Dashboard'),
        createMockCommand('2', 'Settings'),
        createMockCommand('3', 'Profile'),
      ];

      const results = searchCommands('dash', commands);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('returns empty array when no commands match', () => {
      const commands: Command[] = [
        createMockCommand('1', 'Dashboard'),
        createMockCommand('2', 'Settings'),
      ];

      const results = searchCommands('xyz123', commands);

      expect(results).toEqual([]);
    });
  });

  describe('Case-Insensitive Search', () => {
    it('matches regardless of query case', () => {
      const commands: Command[] = [createMockCommand('1', 'dashboard')];

      const resultsLower = searchCommands('dashboard', commands);
      const resultsUpper = searchCommands('DASHBOARD', commands);
      const resultsMixed = searchCommands('DashBoard', commands);

      expect(resultsLower).toHaveLength(1);
      expect(resultsUpper).toHaveLength(1);
      expect(resultsMixed).toHaveLength(1);
    });
  });

  describe('Multiple Matches Ranking', () => {
    it('ranks multiple matches correctly by relevance', () => {
      const commands: Command[] = [
        createMockCommand('1', 'User Settings', {
          description: 'Configure user preferences',
        }), // Contains + description: 50 + 30 = 80
        createMockCommand('2', 'Settings'), // Exact: 100
        createMockCommand('3', 'App Settings'), // Contains: 50
        createMockCommand('4', 'Settings Panel', {
          keywords: ['config'],
        }), // Starts-with: 80
      ];

      const results = searchCommands('Settings', commands);

      expect(results).toHaveLength(4);
      expect(results[0].id).toBe('2'); // 100 (exact)
      // Results[1] and [2] both have score 80, so order may vary
      expect([results[1].id, results[2].id]).toContain('1'); // 80 (contains + description)
      expect([results[1].id, results[2].id]).toContain('4'); // 80 (starts-with)
      expect(results[3].id).toBe('3'); // 50 (contains)
    });

    it('boosts recent commands in ranking', () => {
      localStorage.setItem('command-palette-recent', JSON.stringify(['3']));

      const commands: Command[] = [
        createMockCommand('1', 'Dashboard'), // Exact: 100
        createMockCommand('2', 'Dashboards'), // Starts-with: 80
        createMockCommand('3', 'Go Dashboard'), // Contains + recent: 50 + 20 = 70
      ];

      const results = searchCommands('Dashboard', commands);

      expect(results[0].id).toBe('1'); // 100
      expect(results[1].id).toBe('2'); // 80
      expect(results[2].id).toBe('3'); // 70
    });
  });

  describe('Description and Keyword Matching', () => {
    it('matches commands by description', () => {
      const commands: Command[] = [
        createMockCommand('1', 'Settings', {
          description: 'Configure application preferences',
        }),
        createMockCommand('2', 'Dashboard'),
      ];

      const results = searchCommands('preferences', commands);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('matches commands by keywords', () => {
      const commands: Command[] = [
        createMockCommand('1', 'Settings', {
          keywords: ['config', 'preferences'],
        }),
        createMockCommand('2', 'Dashboard'),
      ];

      const results = searchCommands('config', commands);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty commands array', () => {
      const results = searchCommands('test', []);
      expect(results).toEqual([]);
    });

    it('handles commands with minimal properties', () => {
      const commands: Command[] = [
        {
          id: '1',
          label: 'Minimal',
          category: 'action',
          availableInContexts: ['global'],
          handler: jest.fn(),
        },
      ];

      const results = searchCommands('Minimal', commands);
      expect(results).toHaveLength(1);
    });

    it('trims query whitespace before searching', () => {
      const commands: Command[] = [createMockCommand('1', 'Dashboard')];

      const results = searchCommands('  Dashboard  ', commands);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });
  });
});

describe('searchCommandsOptimized', () => {
  const createMockCommand = (
    id: string,
    label: string,
    options?: Partial<Command>
  ): Command => ({
    id,
    label,
    category: 'navigation',
    availableInContexts: ['global'],
    handler: jest.fn(),
    ...options,
  });

  describe('Cache Behavior', () => {
    it('returns cached results on second call with same query', () => {
      const cache = new Map<string, Command[]>();
      const commands: Command[] = [
        createMockCommand('1', 'Dashboard'),
        createMockCommand('2', 'Settings'),
      ];

      const results1 = searchCommandsOptimized('dash', commands, cache);
      const results2 = searchCommandsOptimized('dash', commands, cache);

      expect(results1).toEqual(results2);
      expect(cache.has('dash')).toBe(true);
      expect(cache.get('dash')).toEqual(results1);
    });

    it('performs new search for different query', () => {
      const cache = new Map<string, Command[]>();
      const commands: Command[] = [
        createMockCommand('1', 'Dashboard'),
        createMockCommand('2', 'Settings'),
      ];

      searchCommandsOptimized('dash', commands, cache);
      const results = searchCommandsOptimized('settings', commands, cache);

      expect(cache.has('dash')).toBe(true);
      expect(cache.has('settings')).toBe(true);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('behaves like searchCommands when no cache provided', () => {
      const commands: Command[] = [createMockCommand('1', 'Dashboard')];

      const results = searchCommandsOptimized('dash', commands);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('does not cache when cache not provided', () => {
      const commands: Command[] = [createMockCommand('1', 'Dashboard')];

      const results1 = searchCommandsOptimized('dash', commands);
      const results2 = searchCommandsOptimized('dash', commands);

      // Results should be equal but not reference-equal (no caching)
      expect(results1).toEqual(results2);
    });
  });

  describe('Cache Correctness', () => {
    it('returns correct results from cache', () => {
      const cache = new Map<string, Command[]>();
      const commands: Command[] = [
        createMockCommand('1', 'Dashboard'),
        createMockCommand('2', 'Dashboards'),
        createMockCommand('3', 'Settings'),
      ];

      // First call: caches results
      const firstCall = searchCommandsOptimized('dash', commands, cache);

      // Modify commands array (simulating new commands added)
      commands.push(createMockCommand('4', 'New Dashboard'));

      // Second call: should return cached results (old results)
      const secondCall = searchCommandsOptimized('dash', commands, cache);

      expect(secondCall).toEqual(firstCall);
      expect(secondCall).toHaveLength(2); // Only original matches
    });

    it('cache invalidation: new search after cache clear', () => {
      const cache = new Map<string, Command[]>();
      const commands: Command[] = [createMockCommand('1', 'Dashboard')];

      searchCommandsOptimized('dash', commands, cache);

      // Clear cache (e.g., after command registration)
      cache.clear();

      commands.push(createMockCommand('2', 'New Dashboard'));

      const results = searchCommandsOptimized('dash', commands, cache);

      expect(results).toHaveLength(2); // Now includes new command
    });
  });
});

describe('Performance Tests', () => {
  const createMockCommand = (
    id: string,
    label: string,
    options?: Partial<Command>
  ): Command => ({
    id,
    label,
    category: 'navigation',
    availableInContexts: ['global'],
    handler: jest.fn(),
    ...options,
  });

  /**
   * Generates test commands for performance benchmarking
   */
  const generateTestCommands = (count: number): Command[] => {
    const commands: Command[] = [];
    const labels = [
      'Dashboard',
      'Settings',
      'Profile',
      'Reports',
      'Analytics',
      'Users',
      'Teams',
      'Projects',
      'Tasks',
      'Calendar',
    ];

    for (let i = 0; i < count; i++) {
      const baseLabel = labels[i % labels.length];
      commands.push(
        createMockCommand(`cmd-${i}`, `${baseLabel} ${i}`, {
          description: `Description for ${baseLabel} ${i}`,
          keywords: ['test', 'command', baseLabel.toLowerCase()],
          priority: i % 10,
        })
      );
    }

    return commands;
  };

  describe('Search Performance Benchmarks', () => {
    it('searches 100 commands in <10ms (AC10)', () => {
      const commands = generateTestCommands(100);

      const start = performance.now();
      const results = searchCommands('test', commands);
      const duration = performance.now() - start;

      // eslint-disable-next-line no-console
      console.log(`[Performance] 100 commands searched in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(10);
      expect(results.length).toBeGreaterThan(0);
    });

    it('searches 300 commands in <10ms (NFR1.4 requirement)', () => {
      const commands = generateTestCommands(300);

      const start = performance.now();
      const results = searchCommands('Dashboard', commands);
      const duration = performance.now() - start;

      // eslint-disable-next-line no-console
      console.log(`[Performance] 300 commands searched in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(10);
      expect(results.length).toBeGreaterThan(0);
    });

    it('searches 1000 commands in <20ms (AC10, NFR1.5)', () => {
      const commands = generateTestCommands(1000);

      const start = performance.now();
      const results = searchCommands('Settings', commands);
      const duration = performance.now() - start;

      // eslint-disable-next-line no-console
      console.log(`[Performance] 1000 commands searched in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(20);
      expect(results.length).toBeGreaterThan(0);
    });

    it('scoreCommand executes quickly for single command', () => {
      const cmd = createMockCommand('perf-test', 'Performance Test Command', {
        description: 'Testing performance of scoring algorithm',
        keywords: ['perf', 'test', 'benchmark'],
        priority: 50,
      });

      const iterations = 10000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        scoreCommand(cmd, 'test');
      }

      const duration = performance.now() - start;
      const avgDuration = duration / iterations;

      // eslint-disable-next-line no-console
      console.log(
        `[Performance] scoreCommand avg: ${avgDuration.toFixed(4)}ms (${iterations} iterations)`
      );

      expect(avgDuration).toBeLessThan(0.01); // <0.01ms per score
    });
  });

  describe('Cache Performance', () => {
    it('cached search is faster than non-cached', () => {
      const commands = generateTestCommands(500);
      const cache = new Map<string, Command[]>();

      // First call: no cache (baseline)
      const start1 = performance.now();
      searchCommandsOptimized('Dashboard', commands, cache);
      const duration1 = performance.now() - start1;

      // Second call: cached (should be faster)
      const start2 = performance.now();
      searchCommandsOptimized('Dashboard', commands, cache);
      const duration2 = performance.now() - start2;

      // eslint-disable-next-line no-console
      console.log(
        `[Performance] Cache benefit: ${duration1.toFixed(2)}ms → ${duration2.toFixed(2)}ms (${((1 - duration2 / duration1) * 100).toFixed(1)}% faster)`
      );

      expect(duration2).toBeLessThan(duration1);
      expect(duration2).toBeLessThan(1); // Cached should be <1ms
    });
  });

  describe('Edge Case Performance', () => {
    it('handles empty query efficiently (no scoring)', () => {
      const commands = generateTestCommands(1000);

      const start = performance.now();
      const results = searchCommands('', commands);
      const duration = performance.now() - start;

      // eslint-disable-next-line no-console
      console.log(
        `[Performance] Empty query (1000 cmds): ${duration.toFixed(2)}ms`
      );

      expect(duration).toBeLessThan(1); // Should be near-instant
      expect(results).toEqual(commands);
    });

    it('handles no-match query efficiently', () => {
      // Generate commands WITHOUT keywords to avoid priority-only matches
      const commands: Command[] = [];
      const labels = ['Dashboard', 'Settings', 'Profile', 'Reports', 'Analytics'];

      for (let i = 0; i < 1000; i++) {
        const baseLabel = labels[i % labels.length];
        commands.push(
          createMockCommand(`cmd-${i}`, `${baseLabel} ${i}`, {
            description: `Description for ${baseLabel} ${i}`,
            // NO keywords - avoids priority-only matches
          })
        );
      }

      const start = performance.now();
      const results = searchCommands('qqqzzz999nonexistent', commands);
      const duration = performance.now() - start;

      // eslint-disable-next-line no-console
      console.log(
        `[Performance] No-match query (1000 cmds): ${duration.toFixed(2)}ms`
      );

      expect(duration).toBeLessThan(20); // Within target
      expect(results).toEqual([]); // True no-match scenario
    });
  });
});
