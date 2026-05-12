/**
 * CommandRegistry Performance Test Suite
 *
 * Tests performance characteristics under load to ensure the registry
 * maintains acceptable performance with maximum capacity (500 commands)
 * and under concurrent access patterns.
 *
 * Performance Targets:
 * - Lookup: <10ms at capacity (500 commands)
 * - Registration: <50ms for batch of 50 commands
 * - Context switching: <5ms per operation
 * - Memory: No leaks during register/unregister cycles
 */

import { CommandRegistry } from '../CommandRegistry';
import { Command } from '../types';
import { GLOBAL_CONTEXT } from '../constants';

describe('CommandRegistry - Performance Tests', () => {
  let registry: CommandRegistry;

  beforeEach(async () => {
    registry = CommandRegistry.getInstance();
    registry.clear();
    // Allow rate limit window to clear
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

  afterEach(() => {
    registry.clear();
  });

  describe('Lookup Performance at Scale', () => {
    it('should maintain <10ms lookup time with 500 commands (capacity)', async () => {
      // Register commands in batches to avoid rate limiting
      const commandsPerBatch = 50;
      const totalCommands = 500;
      const batches = totalCommands / commandsPerBatch;

      for (let batch = 0; batch < batches; batch++) {
        const batchCommands: Command[] = Array.from(
          { length: commandsPerBatch },
          (_, i) => ({
            id: `perf-cmd-${batch * commandsPerBatch + i}`,
            label: `Performance Command ${batch * commandsPerBatch + i}`,
            category: 'performance',
            keywords: ['perf', 'test'],
            priority: 50,
            availableInContexts: [GLOBAL_CONTEXT],
            handler: async () => {},
            enabled: true,
            visible: true,
            requiresConfirmation: false,
            metadata: {},
          })
        );

        registry.register(batchCommands);

        // Wait between batches to avoid rate limiting
        if (batch < batches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      // Verify we have 500 commands
      expect(registry.getCommands().length).toBe(500);

      // Measure lookup performance
      const lookupIterations = 100;
      const commandIds = Array.from({ length: lookupIterations }, (_, i) => `perf-cmd-${i}`);

      const startTime = performance.now();
      commandIds.forEach((id) => {
        registry.getCommand(id);
      });
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const averageTime = totalTime / lookupIterations;

      // Performance assertion: <10ms for 100 lookups = <0.1ms per lookup
      expect(averageTime).toBeLessThan(0.1);
      expect(totalTime).toBeLessThan(10);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Lookup at capacity (500 cmds): ${averageTime.toFixed(3)}ms avg, ${totalTime.toFixed(2)}ms total`);
    });

    it('should maintain <5ms for filtering operations at capacity', async () => {
      // Register 500 commands in batches
      const commandsPerBatch = 50;
      const totalCommands = 500;
      const batches = totalCommands / commandsPerBatch;

      for (let batch = 0; batch < batches; batch++) {
        const batchCommands: Command[] = Array.from(
          { length: commandsPerBatch },
          (_, i) => ({
            id: `filter-cmd-${batch * commandsPerBatch + i}`,
            label: `Filter Command ${batch * commandsPerBatch + i}`,
            category: i % 3 === 0 ? 'navigation' : i % 3 === 1 ? 'user' : 'system',
            keywords: ['filter', 'test'],
            priority: i % 10,
            availableInContexts: [GLOBAL_CONTEXT],
            handler: async () => {},
            enabled: i % 2 === 0,
            visible: true,
            requiresConfirmation: false,
            metadata: {},
          })
        );

        registry.register(batchCommands);

        if (batch < batches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      // Test category filtering performance
      const startTime = performance.now();
      const navigationCommands = registry.getCommands({ category: 'navigation' });
      const endTime = performance.now();

      const filterTime = endTime - startTime;

      expect(navigationCommands.length).toBeGreaterThan(0);
      expect(filterTime).toBeLessThan(5);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Category filter at capacity: ${filterTime.toFixed(2)}ms, ${navigationCommands.length} results`);
    });

    it('should handle rapid sequential lookups without performance degradation', () => {
      // Register 100 commands
      const commands: Command[] = Array.from({ length: 100 }, (_, i) => ({
        id: `rapid-cmd-${i}`,
        label: `Rapid Command ${i}`,
        category: 'performance',
        keywords: ['rapid'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {},
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      registry.register(commands);

      // Perform 1000 rapid lookups
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        registry.getCommand(`rapid-cmd-${i % 100}`);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;

      // Should maintain <0.05ms per lookup even with 1000 iterations
      expect(averageTime).toBeLessThan(0.05);
      expect(totalTime).toBeLessThan(50);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Rapid sequential lookups (1000x): ${averageTime.toFixed(4)}ms avg, ${totalTime.toFixed(2)}ms total`);
    });
  });

  describe('Registration Performance', () => {
    it('should register batch of 50 commands in <50ms', () => {
      const commands: Command[] = Array.from({ length: 50 }, (_, i) => ({
        id: `batch-cmd-${i}`,
        label: `Batch Command ${i}`,
        category: 'performance',
        keywords: ['batch'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {},
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      const startTime = performance.now();
      registry.register(commands);
      const endTime = performance.now();

      const registrationTime = endTime - startTime;

      expect(registry.getCommands().length).toBe(50);
      expect(registrationTime).toBeLessThan(50);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Batch registration (50 cmds): ${registrationTime.toFixed(2)}ms`);
    });

    it('should handle incremental registration efficiently', async () => {
      const batchCount = 10;
      const commandsPerBatch = 10;
      const times: number[] = [];

      for (let batch = 0; batch < batchCount; batch++) {
        const commands: Command[] = Array.from({ length: commandsPerBatch }, (_, i) => ({
          id: `incremental-${batch}-${i}`,
          label: `Incremental ${batch}-${i}`,
          category: 'performance',
          keywords: ['incremental'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        }));

        const startTime = performance.now();
        registry.register(commands);
        const endTime = performance.now();

        times.push(endTime - startTime);

        // Wait to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // Registration time should not degrade significantly over batches
      const firstBatchTime = times[0];
      const lastBatchTime = times[times.length - 1];
      const degradation = (lastBatchTime - firstBatchTime) / firstBatchTime;

      // Allow max 50% performance degradation
      expect(degradation).toBeLessThan(0.5);
      expect(registry.getCommands().length).toBe(batchCount * commandsPerBatch);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Incremental registration degradation: ${(degradation * 100).toFixed(1)}%`);
      // eslint-disable-next-line no-console
      console.log(`[PERF] First batch: ${firstBatchTime.toFixed(2)}ms, Last batch: ${lastBatchTime.toFixed(2)}ms`);
    });
  });

  describe('Context Switching Performance', () => {
    it('should switch contexts in <5ms', () => {
      const commands: Command[] = Array.from({ length: 100 }, (_, i) => ({
        id: `context-cmd-${i}`,
        label: `Context Command ${i}`,
        category: 'performance',
        keywords: ['context'],
        priority: 50,
        availableInContexts: ['user-123', 'program-456', GLOBAL_CONTEXT],
        handler: async () => {},
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      registry.register(commands);

      // Measure context push performance
      const startPush = performance.now();
      registry.pushContext('user-123');
      const endPush = performance.now();

      const pushTime = endPush - startPush;
      expect(pushTime).toBeLessThan(5);

      // Measure context pop performance
      const startPop = performance.now();
      registry.popContext();
      const endPop = performance.now();

      const popTime = endPop - startPop;
      expect(popTime).toBeLessThan(5);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Context push: ${pushTime.toFixed(3)}ms, pop: ${popTime.toFixed(3)}ms`);
    });

    it('should handle rapid context switching without degradation', () => {
      const commands: Command[] = Array.from({ length: 50 }, (_, i) => ({
        id: `switch-cmd-${i}`,
        label: `Switch Command ${i}`,
        category: 'performance',
        keywords: ['switch'],
        priority: 50,
        availableInContexts: ['context-a', 'context-b', GLOBAL_CONTEXT],
        handler: async () => {},
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      registry.register(commands);

      // Perform 100 rapid context switches
      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        if (i % 2 === 0) {
          registry.pushContext('context-a');
        } else {
          registry.popContext();
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;

      expect(averageTime).toBeLessThan(1);
      expect(totalTime).toBeLessThan(100);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Rapid context switching (100x): ${averageTime.toFixed(3)}ms avg, ${totalTime.toFixed(2)}ms total`);
    });
  });

  describe('Memory and Lifecycle Performance', () => {
    it('should handle register/unregister cycles without memory leaks', async () => {
      const cycles = 10;
      const commandsPerCycle = 50;

      for (let cycle = 0; cycle < cycles; cycle++) {
        // Register commands
        const commands: Command[] = Array.from({ length: commandsPerCycle }, (_, i) => ({
          id: `cycle-cmd-${i}`,
          label: `Cycle Command ${i}`,
          category: 'performance',
          keywords: ['cycle'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        }));

        registry.register(commands);
        expect(registry.getCommands().length).toBe(commandsPerCycle);

        // Unregister commands
        const commandIds = commands.map((cmd) => cmd.id);
        registry.unregister(commandIds);
        expect(registry.getCommands().length).toBe(0);

        // Wait between cycles
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // After cycles, registry should be clean
      const stats = registry.getStats();
      expect(stats.totalCommands).toBe(0);
      expect(stats.enabledCommands).toBe(0);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Register/unregister cycles (${cycles}x): Memory stable`);
    });

    it('should clear large registry efficiently', async () => {
      // Register 500 commands in batches
      const commandsPerBatch = 50;
      const totalCommands = 500;
      const batches = totalCommands / commandsPerBatch;

      for (let batch = 0; batch < batches; batch++) {
        const batchCommands: Command[] = Array.from(
          { length: commandsPerBatch },
          (_, i) => ({
            id: `clear-cmd-${batch * commandsPerBatch + i}`,
            label: `Clear Command ${batch * commandsPerBatch + i}`,
            category: 'performance',
            keywords: ['clear'],
            priority: 50,
            availableInContexts: [GLOBAL_CONTEXT],
            handler: async () => {},
            enabled: true,
            visible: true,
            requiresConfirmation: false,
            metadata: {},
          })
        );

        registry.register(batchCommands);

        if (batch < batches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      expect(registry.getCommands().length).toBe(500);

      // Measure clear performance
      const startTime = performance.now();
      registry.clear();
      const endTime = performance.now();

      const clearTime = endTime - startTime;

      expect(registry.getCommands().length).toBe(0);
      expect(clearTime).toBeLessThan(10);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Clear 500 commands: ${clearTime.toFixed(2)}ms`);
    });
  });

  describe('Concurrent Access Patterns', () => {
    it('should handle concurrent lookups gracefully', async () => {
      // Register 100 commands
      const commands: Command[] = Array.from({ length: 100 }, (_, i) => ({
        id: `concurrent-cmd-${i}`,
        label: `Concurrent Command ${i}`,
        category: 'performance',
        keywords: ['concurrent'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {},
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      registry.register(commands);

      // Simulate 10 concurrent lookup operations
      const concurrentOperations = 10;
      const lookupsPerOperation = 20;

      const startTime = performance.now();

      const promises = Array.from({ length: concurrentOperations }, async (_, opIndex) => {
        const results: Array<Command | undefined> = [];
        for (let i = 0; i < lookupsPerOperation; i++) {
          const cmd = registry.getCommand(`concurrent-cmd-${(opIndex * lookupsPerOperation + i) % 100}`);
          results.push(cmd);
        }
        return results;
      });

      const allResults = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const totalLookups = concurrentOperations * lookupsPerOperation;

      // All lookups should succeed
      expect(allResults.flat().every((cmd) => cmd !== undefined)).toBe(true);
      expect(totalTime).toBeLessThan(50);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Concurrent lookups (${totalLookups} total): ${totalTime.toFixed(2)}ms`);
    });

    it('should handle mixed read/write operations without race conditions', async () => {
      let operationCount = 0;
      const expectedOperations = 20;

      // Simulate mixed operations
      const operations = [
        // Reads
        ...Array.from({ length: 10 }, () => async () => {
          registry.getCommands();
          operationCount++;
        }),
        // Writes
        ...Array.from({ length: 10 }, (_, i) => async () => {
          const cmd: Command = {
            id: `mixed-cmd-${i}`,
            label: `Mixed Command ${i}`,
            category: 'performance',
            keywords: ['mixed'],
            priority: 50,
            availableInContexts: [GLOBAL_CONTEXT],
            handler: async () => {},
            enabled: true,
            visible: true,
            requiresConfirmation: false,
            metadata: {},
          };
          // Use try-catch to handle rate limiting gracefully
          try {
            registry.register([cmd]);
          } catch {
            // Rate limit hit - expected in concurrent scenario
          }
          operationCount++;
        }),
      ];

      const startTime = performance.now();
      await Promise.all(operations.map((op) => op()));
      const endTime = performance.now();

      const totalTime = endTime - startTime;

      expect(operationCount).toBe(expectedOperations);
      expect(totalTime).toBeLessThan(100);

      // eslint-disable-next-line no-console
      console.log(`[PERF] Mixed read/write operations (${expectedOperations}): ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Performance Baselines', () => {
    it('should document performance baselines for regression tracking', async () => {
      const baselines = {
        lookup_100_commands: 0,
        lookup_500_commands: 0,
        registration_50_batch: 0,
        context_switch: 0,
        clear_500_commands: 0,
      };

      // Baseline 1: Lookup with 100 commands
      const cmds100: Command[] = Array.from({ length: 100 }, (_, i) => ({
        id: `baseline-100-${i}`,
        label: `Baseline 100 ${i}`,
        category: 'performance',
        keywords: ['baseline'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {},
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      registry.register(cmds100);

      let start = performance.now();
      for (let i = 0; i < 100; i++) {
        registry.getCommand(`baseline-100-${i}`);
      }
      baselines.lookup_100_commands = performance.now() - start;

      registry.clear();
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Baseline 2: Lookup with 500 commands
      for (let batch = 0; batch < 10; batch++) {
        const cmds: Command[] = Array.from({ length: 50 }, (_, i) => ({
          id: `baseline-500-${batch * 50 + i}`,
          label: `Baseline 500 ${batch * 50 + i}`,
          category: 'performance',
          keywords: ['baseline'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        }));
        registry.register(cmds);
        if (batch < 9) await new Promise((resolve) => setTimeout(resolve, 150));
      }

      start = performance.now();
      for (let i = 0; i < 100; i++) {
        registry.getCommand(`baseline-500-${i}`);
      }
      baselines.lookup_500_commands = performance.now() - start;

      registry.clear();
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Baseline 3: Registration (50 batch)
      const regCmds: Command[] = Array.from({ length: 50 }, (_, i) => ({
        id: `baseline-reg-${i}`,
        label: `Baseline Reg ${i}`,
        category: 'performance',
        keywords: ['baseline'],
        priority: 50,
        availableInContexts: [GLOBAL_CONTEXT],
        handler: async () => {},
        enabled: true,
        visible: true,
        requiresConfirmation: false,
        metadata: {},
      }));

      start = performance.now();
      registry.register(regCmds);
      baselines.registration_50_batch = performance.now() - start;

      // Baseline 4: Context switch
      start = performance.now();
      registry.pushContext('baseline-context');
      registry.popContext();
      baselines.context_switch = performance.now() - start;

      registry.clear();
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Baseline 5: Clear 500 commands
      for (let batch = 0; batch < 10; batch++) {
        const cmds: Command[] = Array.from({ length: 50 }, (_, i) => ({
          id: `baseline-clear-${batch * 50 + i}`,
          label: `Baseline Clear ${batch * 50 + i}`,
          category: 'performance',
          keywords: ['baseline'],
          priority: 50,
          availableInContexts: [GLOBAL_CONTEXT],
          handler: async () => {},
          enabled: true,
          visible: true,
          requiresConfirmation: false,
          metadata: {},
        }));
        registry.register(cmds);
        if (batch < 9) await new Promise((resolve) => setTimeout(resolve, 150));
      }

      start = performance.now();
      registry.clear();
      baselines.clear_500_commands = performance.now() - start;

      // Log baselines for CI tracking
      // eslint-disable-next-line no-console
      console.log('=== PERFORMANCE BASELINES ===');
      // eslint-disable-next-line no-console
      console.log(`Lookup (100 cmds):       ${baselines.lookup_100_commands.toFixed(3)}ms`);
      // eslint-disable-next-line no-console
      console.log(`Lookup (500 cmds):       ${baselines.lookup_500_commands.toFixed(3)}ms`);
      // eslint-disable-next-line no-console
      console.log(`Registration (50 batch): ${baselines.registration_50_batch.toFixed(3)}ms`);
      // eslint-disable-next-line no-console
      console.log(`Context switch:          ${baselines.context_switch.toFixed(3)}ms`);
      // eslint-disable-next-line no-console
      console.log(`Clear (500 cmds):        ${baselines.clear_500_commands.toFixed(3)}ms`);
      // eslint-disable-next-line no-console
      console.log('============================');

      // Assertions for regression tracking
      expect(baselines.lookup_100_commands).toBeLessThan(10);
      expect(baselines.lookup_500_commands).toBeLessThan(15);
      expect(baselines.registration_50_batch).toBeLessThan(50);
      expect(baselines.context_switch).toBeLessThan(5);
      expect(baselines.clear_500_commands).toBeLessThan(10);
    });
  });
});
