/**
 * Settings Slice Unit Tests
 *
 * Epic 1 - Story 1.1: Create Normalized Redux State Structure
 *
 * Test Coverage:
 * - Initial state structure
 * - Autosave queue with circuit breaker (10+ scenarios)
 * - Async thunk lifecycle (pending/fulfilled/rejected)
 * - Optimistic updates with rollback
 *
 * Target: 100% code coverage
 */

import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import settingsReducer, {
  addToAutosaveQueue,
  removeFromAutosaveQueue,
  flushAutosaveQueue,
  clearAutosaveErrors,
  setBandwidthOptimistic,
  triggerStateRollback,
  updateApiKey,
  updateTheme,
  saveTemplate,
  updateBandwidth,
  toggleBandwidth,
  _SettingsState,
} from '../settingsSlice';

// Mock axios
jest.mock('axios');

// Helper to create a fresh store for each test
const createTestStore = () => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
  });
};

describe('SettingsSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // INITIAL STATE TESTS
  // ============================================================================

  describe('Initial State', () => {
    it('should have correct structure matching _SettingsState interface', () => {
      const store = createTestStore();
      const state = store.getState().settings;

      // Verify 7 domain groups exist
      expect(state).toHaveProperty('general');
      expect(state).toHaveProperty('appearance');
      expect(state).toHaveProperty('integrations');
      expect(state).toHaveProperty('templates');
      expect(state).toHaveProperty('plans');
      expect(state).toHaveProperty('content');
      expect(state).toHaveProperty('advanced');

      // Verify autosave queue structure
      expect(state).toHaveProperty('autosaveQueue');
      expect(state.autosaveQueue).toHaveProperty('pending');
      expect(state.autosaveQueue).toHaveProperty('maxQueueSize');
      expect(state.autosaveQueue).toHaveProperty('errors');

      // Verify meta state
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('errors');
      expect(state).toHaveProperty('lastSaved');

      // Verify migration fields
      expect(state).toHaveProperty('_migrated');
      expect(state._migrated).toBe(false);
    });

    it('should initialize with sensible defaults', () => {
      const store = createTestStore();
      const state = store.getState().settings;

      // General domain
      expect(state.general.clientId).toBe('');
      expect(state.general.inviteCode).toBe('');
      expect(state.general.selfRegistration.active).toBe(false);

      // Appearance domain
      expect(state.appearance.theme.name).toBe('default');
      expect(state.appearance.theme.customColors).toEqual({});

      // Integrations domain
      expect(state.integrations.openaiApiKey).toBe('');
      expect(state.integrations.openaiApiKeyActive).toBe(false);

      // Templates domain
      expect(state.templates.invite).toBe('');
      expect(state.templates.bulkInvite).toBe('');
      expect(state.templates.resultEmail).toBe('');
      expect(state.templates.consentForm).toBe('');
      expect(state.templates.rom).toBe('');

      // Advanced domain
      expect(state.advanced.bandwidth.mode).toBe('high');
      expect(state.advanced.bandwidth.networkIssue).toBe(false);
      expect(state.advanced.tags).toEqual([]);

      // Autosave queue
      expect(state.autosaveQueue.pending).toEqual([]);
      expect(state.autosaveQueue.maxQueueSize).toBe(10);
      expect(state.autosaveQueue.errors).toEqual([]);

      // Meta state
      expect(state.loading).toEqual({});
      expect(state.errors).toEqual({});
      expect(state.lastSaved).toEqual({});
    });
  });

  // ============================================================================
  // AUTOSAVE QUEUE - CIRCUIT BREAKER TESTS
  // ============================================================================

  describe('Autosave Queue - Circuit Breaker', () => {
    it('should add item to pending when queue is empty', () => {
      const store = createTestStore();

      store.dispatch(
        addToAutosaveQueue({
          queueKey: 'templates.invite',
          content: 'Hello {{name}}',
        })
      );

      const state = store.getState().settings;
      expect(state.autosaveQueue.pending).toHaveLength(1);
      expect(state.autosaveQueue.pending[0].queueKey).toBe('templates.invite');
      expect(state.autosaveQueue.pending[0].content).toBe('Hello {{name}}');
      expect(state.autosaveQueue.pending[0].retries).toBe(0);
      expect(state.autosaveQueue.pending[0].timestamp).toBeDefined();
    });

    it('should add item to errors when queue is full (circuit breaker)', () => {
      const store = createTestStore();

      // Fill queue to max capacity (10 items)
      for (let i = 0; i < 10; i++) {
        store.dispatch(
          addToAutosaveQueue({
            queueKey: `item-${i}`,
            content: `content-${i}`,
          })
        );
      }

      // Verify queue is full
      let state = store.getState().settings;
      expect(state.autosaveQueue.pending).toHaveLength(10);
      expect(state.autosaveQueue.errors).toHaveLength(0);

      // Try to add 11th item (should trigger circuit breaker)
      store.dispatch(
        addToAutosaveQueue({
          queueKey: 'item-11',
          content: 'content-11',
        })
      );

      state = store.getState().settings;
      expect(state.autosaveQueue.pending).toHaveLength(10); // Still 10
      expect(state.autosaveQueue.errors).toHaveLength(1); // Error added
      expect(state.autosaveQueue.errors[0].queueKey).toBe('item-11');
      expect(state.autosaveQueue.errors[0].error).toContain('queue full');
    });

    it('should update existing item when queueKey already exists', () => {
      const store = createTestStore();

      // Add initial item
      store.dispatch(
        addToAutosaveQueue({
          queueKey: 'templates.invite',
          content: 'Original content',
        })
      );

      let state = store.getState().settings;
      const _originalTimestamp = state.autosaveQueue.pending[0].timestamp;

      // Update same key with new content
      jest.advanceTimersByTime(1000); // Advance time to ensure different timestamp
      store.dispatch(
        addToAutosaveQueue({
          queueKey: 'templates.invite',
          content: 'Updated content',
        })
      );

      state = store.getState().settings;
      expect(state.autosaveQueue.pending).toHaveLength(1); // Still 1 item
      expect(state.autosaveQueue.pending[0].content).toBe('Updated content');
      expect(state.autosaveQueue.pending[0].queueKey).toBe('templates.invite');
    });

    it('should remove item from queue by queueKey', () => {
      const store = createTestStore();

      // Add multiple items
      store.dispatch(addToAutosaveQueue({ queueKey: 'item-1', content: 'content-1' }));
      store.dispatch(addToAutosaveQueue({ queueKey: 'item-2', content: 'content-2' }));
      store.dispatch(addToAutosaveQueue({ queueKey: 'item-3', content: 'content-3' }));

      let state = store.getState().settings;
      expect(state.autosaveQueue.pending).toHaveLength(3);

      // Remove middle item
      store.dispatch(removeFromAutosaveQueue('item-2'));

      state = store.getState().settings;
      expect(state.autosaveQueue.pending).toHaveLength(2);
      expect(state.autosaveQueue.pending.find(item => item.queueKey === 'item-2')).toBeUndefined();
      expect(state.autosaveQueue.pending.find(item => item.queueKey === 'item-1')).toBeDefined();
      expect(state.autosaveQueue.pending.find(item => item.queueKey === 'item-3')).toBeDefined();
    });

    it('should flush all items from queue', () => {
      const store = createTestStore();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Add multiple items
      store.dispatch(addToAutosaveQueue({ queueKey: 'item-1', content: 'content-1' }));
      store.dispatch(addToAutosaveQueue({ queueKey: 'item-2', content: 'content-2' }));

      let state = store.getState().settings;
      expect(state.autosaveQueue.pending).toHaveLength(2);

      // Flush queue
      store.dispatch(flushAutosaveQueue());

      state = store.getState().settings;
      expect(state.autosaveQueue.pending).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it('should clear autosave errors', () => {
      const store = createTestStore();

      // Fill queue and trigger circuit breaker
      for (let i = 0; i < 11; i++) {
        store.dispatch(addToAutosaveQueue({ queueKey: `item-${i}`, content: `content-${i}` }));
      }

      let state = store.getState().settings;
      expect(state.autosaveQueue.errors).toHaveLength(1);

      // Clear errors
      store.dispatch(clearAutosaveErrors());

      state = store.getState().settings;
      expect(state.autosaveQueue.errors).toHaveLength(0);
    });

    it('should handle multiple rapid successive calls', () => {
      const store = createTestStore();

      // Simulate rapid autosave calls
      for (let i = 0; i < 5; i++) {
        store.dispatch(
          addToAutosaveQueue({
            queueKey: 'templates.invite',
            content: `Content version ${i}`,
          })
        );
      }

      const state = store.getState().settings;
      // Should only have 1 item (all updates to same key)
      expect(state.autosaveQueue.pending).toHaveLength(1);
      expect(state.autosaveQueue.pending[0].content).toBe('Content version 4');
    });
  });

  // ============================================================================
  // ASYNC THUNK - updateApiKey
  // ============================================================================

  describe('Async Thunk - updateApiKey', () => {
    it('pending: should set loading.apiKey=true and errors.apiKey=null', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn(() => new Promise(() => {})); // Never resolves

      store.dispatch(updateApiKey('test-api-key'));

      const state = store.getState().settings;
      expect(state.loading.apiKey).toBe(true);
      expect(state.errors.apiKey).toBe(null);
    });

    it('fulfilled: should update integrations.openaiApiKey and set lastSaved.apiKey', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({
        data: { openaiApiKey: 'test-api-key' },
      });

      await store.dispatch(updateApiKey('test-api-key'));

      const state = store.getState().settings;
      expect(state.loading.apiKey).toBe(false);
      expect(state.integrations.openaiApiKey).toBe('test-api-key');
      expect(state.integrations.openaiApiKeyActive).toBe(true);
      expect(typeof state.lastSaved.apiKey).toBe('number');
      expect(state.errors.apiKey).toBe(null);
    });

    it('rejected: should set errors.apiKey with error message', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: { data: { message: 'Invalid API key' } },
      });
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await store.dispatch(updateApiKey('invalid-key'));

      const state = store.getState().settings;
      expect(state.loading.apiKey).toBe(false);
      expect(state.errors.apiKey).toBe('Invalid API key');
    });
  });

  // ============================================================================
  // ASYNC THUNK - updateTheme
  // ============================================================================

  describe('Async Thunk - updateTheme', () => {
    it('pending: should set loading.theme=true', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn(() => new Promise(() => {}));

      store.dispatch(updateTheme({ name: 'dark', locked: true }));

      const state = store.getState().settings;
      expect(state.loading.theme).toBe(true);
      expect(state.errors.theme).toBe(null);
    });

    it('fulfilled: should update appearance.theme and set lastSaved.theme', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({
        data: { id: '123', name: 'dark', locked: true },
      });

      await store.dispatch(updateTheme({ name: 'dark', locked: true }));

      const state = store.getState().settings;
      expect(state.loading.theme).toBe(false);
      expect(state.appearance.theme.name).toBe('dark');
      expect(state.appearance.theme.locked).toBe(true);
      expect(typeof state.lastSaved.theme).toBe('number');
    });

    it('rejected: should set errors.theme', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: { data: { message: 'Theme not found' } },
      });
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await store.dispatch(updateTheme({ name: 'invalid' }));

      const state = store.getState().settings;
      expect(state.loading.theme).toBe(false);
      expect(state.errors.theme).toBe('Theme not found');
    });
  });

  // ============================================================================
  // ASYNC THUNK - saveTemplate
  // ============================================================================

  describe('Async Thunk - saveTemplate', () => {
    it('pending: should set loading for specific template type', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn(() => new Promise(() => {}));

      store.dispatch(saveTemplate({ type: 'invite', template: 'Hello {{name}}' }));

      const state = store.getState().settings;
      expect(state.loading['templates.invite']).toBe(true);
      expect(state.errors['templates.invite']).toBe(null);
    });

    it('fulfilled: should update correct template and set lastSaved', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({
        data: { templateBody: 'Hello {{name}}' },
      });

      await store.dispatch(saveTemplate({ type: 'invite', template: 'Hello {{name}}' }));

      const state = store.getState().settings;
      expect(state.loading['templates.invite']).toBe(false);
      expect(state.templates.invite).toBe('Hello {{name}}');
      expect(typeof state.lastSaved['templates.invite']).toBe('number');
    });

    it('fulfilled: should handle consent form template with "content" field', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({
        data: { content: 'Consent form content' },
      });

      await store.dispatch(saveTemplate({ type: 'consent', template: 'Consent form content' }));

      const state = store.getState().settings;
      expect(state.templates.consentForm).toBe('Consent form content');
    });

    it('rejected: should set errors for specific template type', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: { data: { message: 'Template save failed' } },
      });
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await store.dispatch(saveTemplate({ type: 'invite', template: 'Test' }));

      const state = store.getState().settings;
      expect(state.loading['templates.invite']).toBe(false);
      expect(state.errors['templates.invite']).toBe('Template save failed');
    });

    it('should route to correct endpoint for each template type', async () => {
      const store = createTestStore();
      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({ data: {} });

      const templateTypes: Array<'invite' | 'bulk' | 'result' | 'consent' | 'rom'> = [
        'invite',
        'bulk',
        'result',
        'consent',
        'rom',
      ];

      const expectedEndpoints = [
        '/settings/invite-template-update',
        '/settings/bulk-invite-template-update',
        '/settings/result-email-template-update',
        '/settings/consent-form-template-update',
        '/settings/rom-template-update',
      ];

      for (let i = 0; i < templateTypes.length; i++) {
        await store.dispatch(saveTemplate({ type: templateTypes[i], template: 'test' }));
        expect((axios.post as jest.Mock)).toHaveBeenCalledWith(
          expectedEndpoints[i],
          expect.any(Object)
        );
      }
    });
  });

  // ============================================================================
  // ASYNC THUNK - updateBandwidth (Optimistic Update)
  // ============================================================================

  describe('Async Thunk - updateBandwidth (Optimistic Update)', () => {
    it('should apply optimistic update immediately', () => {
      const store = createTestStore();

      store.dispatch(setBandwidthOptimistic('low'));

      const state = store.getState().settings;
      expect(state.advanced.bandwidth.mode).toBe('low');
      expect(state.advanced.bandwidth.networkIssue).toBe(true);
    });

    it('fulfilled: should keep optimistic update and set lastSaved', async () => {
      const store = createTestStore();

      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({ data: { networkIssue: true } });

      // Apply optimistic update
      store.dispatch(setBandwidthOptimistic('low'));

      // Confirm with API
      await store.dispatch(updateBandwidth('low'));

      const state = store.getState().settings;
      expect(state.advanced.bandwidth.mode).toBe('low');
      expect(typeof state.lastSaved.bandwidth).toBe('number');
      expect(state.loading.bandwidth).toBe(false);
    });

    it('rejected: should rollback optimistic update on error', async () => {
      const store = createTestStore();

      // Start with high bandwidth
      expect(store.getState().settings.advanced.bandwidth.mode).toBe('high');

      // Apply optimistic update to low
      store.dispatch(setBandwidthOptimistic('low'));
      expect(store.getState().settings.advanced.bandwidth.mode).toBe('low');

      // API fails
      (axios.post as jest.Mock) = jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: { data: { message: 'Network error' } },
      });
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      await store.dispatch(updateBandwidth('low'));

      const state = store.getState().settings;
      // Should rollback to high
      expect(state.advanced.bandwidth.mode).toBe('high');
      expect(state.advanced.bandwidth.networkIssue).toBe(false);
      expect(state.errors.bandwidth).toBe('Network error');
    });
  });

  // ============================================================================
  // ASYNC THUNK - toggleBandwidth (Story 3.1: Optimistic Updates)
  // ============================================================================

  describe('Async Thunk - toggleBandwidth (Story 3.1: Optimistic Updates)', () => {
    it('pending: should apply optimistic update immediately (AC: 1, 2)', async () => {
      const store = createTestStore();

      // Start with high bandwidth (default)
      expect(store.getState().settings.advanced.bandwidth.mode).toBe('high');
      expect(store.getState().settings.advanced.bandwidth.networkIssue).toBe(false);

      // Mock API to never resolve (simulate slow network)
      (axios.post as jest.Mock) = jest.fn(() => new Promise(() => {}));

      // Dispatch toggle
      store.dispatch(toggleBandwidth());

      // State should change immediately (optimistic update)
      const state = store.getState().settings;
      expect(state.advanced.bandwidth.mode).toBe('low');
      expect(state.advanced.bandwidth.networkIssue).toBe(true);
      expect(state.loading.bandwidth).toBe(true);
      expect(state.errors.bandwidth).toBe(null);
    });

    it('fulfilled: should keep optimistic state and show success (AC: 3)', async () => {
      const store = createTestStore();

      // Start with high bandwidth
      expect(store.getState().settings.advanced.bandwidth.mode).toBe('high');

      // Mock successful API call
      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({
        data: { networkIssue: true },
      });

      // Dispatch toggle (high → low)
      await store.dispatch(toggleBandwidth());

      const state = store.getState().settings;
      // State should remain toggled (low)
      expect(state.advanced.bandwidth.mode).toBe('low');
      expect(state.advanced.bandwidth.networkIssue).toBe(true);
      expect(state.loading.bandwidth).toBe(false);
      expect(state.errors.bandwidth).toBe(null);
      expect(typeof state.lastSaved.bandwidth).toBe('number');

      // Verify API was called with correct payload
      expect(axios.post).toHaveBeenLastCalledWith('/settings/network', { networkIssue: true });
    });

    it('fulfilled: should toggle from low to high', async () => {
      const store = createTestStore();

      // Set initial state to low
      store.dispatch(setBandwidthOptimistic('low'));
      expect(store.getState().settings.advanced.bandwidth.mode).toBe('low');

      // Mock successful API call
      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({
        data: { networkIssue: false },
      });

      // Toggle back to high
      await store.dispatch(toggleBandwidth());

      const state = store.getState().settings;
      expect(state.advanced.bandwidth.mode).toBe('high');
      expect(state.advanced.bandwidth.networkIssue).toBe(false);
      expect(state.loading.bandwidth).toBe(false);

      // Verify API was called with correct payload
      expect(axios.post).toHaveBeenLastCalledWith('/settings/network', { networkIssue: false });
    });

    it('rejected: should rollback to previous state on API error (AC: 4, 5)', async () => {
      const store = createTestStore();

      // Start with high bandwidth
      expect(store.getState().settings.advanced.bandwidth.mode).toBe('high');

      // Mock API error
      (axios.post as jest.Mock) = jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: { data: { message: 'Server error' } },
      });
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      // Dispatch toggle
      await store.dispatch(toggleBandwidth());

      const state = store.getState().settings;
      // Should rollback to original state (high)
      expect(state.advanced.bandwidth.mode).toBe('high');
      expect(state.advanced.bandwidth.networkIssue).toBe(false);
      expect(state.loading.bandwidth).toBe(false);
      expect(state.errors.bandwidth).toBe('Server error');
    });

    it('rejected: should handle network timeout and rollback (AC: 7)', async () => {
      const store = createTestStore();

      // Start with low bandwidth
      store.dispatch(setBandwidthOptimistic('low'));
      expect(store.getState().settings.advanced.bandwidth.mode).toBe('low');

      // Mock network timeout (no response data)
      (axios.post as jest.Mock) = jest.fn().mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      });
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      // Toggle (should fail and rollback)
      await store.dispatch(toggleBandwidth());

      const state = store.getState().settings;
      // Should rollback to previous state (low)
      expect(state.advanced.bandwidth.mode).toBe('low');
      expect(state.advanced.bandwidth.networkIssue).toBe(true);
      expect(state.loading.bandwidth).toBe(false);
      expect(state.errors.bandwidth).toContain('timeout');
    });

    it('rejected: should handle non-Axios errors', async () => {
      const store = createTestStore();

      // Mock generic error (not axios)
      (axios.post as jest.Mock) = jest.fn().mockRejectedValue(new Error('Network failure'));
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(false);

      await store.dispatch(toggleBandwidth());

      const state = store.getState().settings;
      expect(state.errors.bandwidth).toBe('An unexpected error occurred');
      expect(state.loading.bandwidth).toBe(false);
    });

    it('should handle rapid successive toggles (race condition)', async () => {
      const store = createTestStore();

      // Mock successful API calls
      (axios.post as jest.Mock) = jest.fn().mockResolvedValue({
        data: { networkIssue: true },
      });

      // Dispatch multiple toggles rapidly
      const promise1 = store.dispatch(toggleBandwidth());
      const promise2 = store.dispatch(toggleBandwidth());
      const promise3 = store.dispatch(toggleBandwidth());

      // Wait for all to complete
      await Promise.all([promise1, promise2, promise3]);

      const state = store.getState().settings;
      // Final state should be consistent
      expect(state.loading.bandwidth).toBe(false);
      expect(['high', 'low']).toContain(state.advanced.bandwidth.mode);
    });

    it('should use _bandwidthRollback for state restoration', async () => {
      const store = createTestStore();

      // Start with high bandwidth
      expect(store.getState().settings.advanced.bandwidth.mode).toBe('high');

      // Mock API error
      (axios.post as jest.Mock) = jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: { data: { message: 'Temporary failure' } },
      });
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      // Dispatch toggle (will fail)
      await store.dispatch(toggleBandwidth());

      const state = store.getState().settings;
      // Should have rolled back to original state
      expect(state.advanced.bandwidth.mode).toBe('high');
      expect(state.advanced.bandwidth.networkIssue).toBe(false);
      expect(state._bandwidthRollback).toBe(null); // Rollback state should be cleared
      expect(state.errors.bandwidth).toBe('Temporary failure');
    });

    it('should clear errors on successful retry after failure', async () => {
      const store = createTestStore();

      // First attempt fails
      (axios.post as jest.Mock) = jest.fn().mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: 'First failure' } },
      }).mockResolvedValueOnce({
        data: { networkIssue: true },
      });
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      // First toggle fails
      await store.dispatch(toggleBandwidth());
      let state = store.getState().settings;
      expect(state.errors.bandwidth).toBe('First failure');

      // Retry succeeds
      await store.dispatch(toggleBandwidth());
      state = store.getState().settings;
      expect(state.errors.bandwidth).toBe(null);
      expect(state.loading.bandwidth).toBe(false);
    });
  });

  // ============================================================================
  // MIGRATION SUPPORT
  // ============================================================================

  describe('Migration Support', () => {
    it('should trigger state rollback and log error', () => {
      const store = createTestStore();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      store.dispatch(triggerStateRollback({ reason: 'Migration failed' }));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SettingsSlice] State rollback triggered:',
        'Migration failed'
      );

      consoleSpy.mockRestore();
    });

    it('should have _migrated flag set to false initially', () => {
      const store = createTestStore();
      const state = store.getState().settings;

      expect(state._migrated).toBe(false);
    });
  });
});
