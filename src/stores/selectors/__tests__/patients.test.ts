/**
 * Patient Selectors Tests
 *
 * @description Unit tests for patient selectors
 */

import {
  selectNewPatientsData,
  selectNewPatientsCount,
  selectAllActivePatients,
  selectActivePatientCount,
  selectPatientCountsByStatus,
} from '../patients';
import type { ReduxState } from '@stores/index';

// Mock state helper
const createMockState = (overrides?: Partial<ReduxState>): ReduxState => ({
  newPatients: {
    data: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
  },
  reviewed: {
    vitalscan-rom: { users: [], pagination: {}, statusToRefresh: [] },
    rehab: { users: [], pagination: {}, statusToRefresh: [] },
    evaluation: { users: [], pagination: {}, statusToRefresh: [] },
    survey: { users: [], pagination: {}, statusToRefresh: [] },
    postures: { users: [], pagination: {}, statusToRefresh: [] },
  },
  pendingReview: {
    vitalscan-rom: { users: [], pagination: {}, statusToRefresh: [] },
    rehab: { users: [], pagination: {}, statusToRefresh: [] },
    evaluation: { users: [], pagination: {}, statusToRefresh: [] },
    survey: { users: [], pagination: {}, statusToRefresh: [] },
    postures: { users: [], pagination: {}, statusToRefresh: [] },
  },
  outOfParams: {
    vitalscan-rom: { users: [], pagination: {}, statusToRefresh: [] },
    rehab: { users: [], pagination: {}, statusToRefresh: [] },
    evaluation: { users: [], pagination: {}, statusToRefresh: [] },
    survey: { users: [], pagination: {}, statusToRefresh: [] },
    postures: { users: [], pagination: {}, statusToRefresh: [] },
  },
  escalationRequired: {
    vitalscan-rom: { users: [], pagination: {}, statusToRefresh: [] },
    rehab: { users: [], pagination: {}, statusToRefresh: [] },
    evaluation: { users: [], pagination: {}, statusToRefresh: [] },
    survey: { users: [], pagination: {}, statusToRefresh: [] },
    postures: { users: [], pagination: {}, statusToRefresh: [] },
  },
  followUpRequired: {
    vitalscan-rom: { users: [], pagination: {}, statusToRefresh: [] },
    rehab: { users: [], pagination: {}, statusToRefresh: [] },
    evaluation: { users: [], pagination: {}, statusToRefresh: [] },
    survey: { users: [], pagination: {}, statusToRefresh: [] },
    postures: { users: [], pagination: {}, statusToRefresh: [] },
  },
  adminDashboardPatient: { data: null },
  ...overrides,
} as unknown as ReduxState);

describe('Patient Selectors', () => {
  describe('selectNewPatientsData', () => {
    it('should select new patients data', () => {
      const mockData = [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }];
      const state = createMockState({
        newPatients: {
          data: mockData,
          pagination: { currentPage: 1, totalPages: 1, totalItems: 2 },
        },
      } as unknown as Partial<ReduxState>);

      const result = selectNewPatientsData(state);
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no data', () => {
      const state = createMockState();
      const result = selectNewPatientsData(state);
      expect(result).toEqual([]);
    });
  });

  describe('selectNewPatientsCount', () => {
    it('should count new patients', () => {
      const mockData = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const state = createMockState({
        newPatients: {
          data: mockData,
          pagination: { currentPage: 1, totalPages: 1, totalItems: 3 },
        },
      } as unknown as Partial<ReduxState>);

      const result = selectNewPatientsCount(state);
      expect(result).toBe(3);
    });

    it('should return 0 when no patients', () => {
      const state = createMockState();
      const result = selectNewPatientsCount(state);
      expect(result).toBe(0);
    });
  });

  describe('selectAllActivePatients', () => {
    it('should combine new, reviewed, and pending patients', () => {
      const newPatients = [{ id: '1', status: 'new' }];
      const reviewedPatients = [{ id: '2', status: 'reviewed' }];
      const pendingPatients = [{ id: '3', status: 'pending' }];

      const state = createMockState({
        newPatients: {
          data: newPatients,
          pagination: {},
        },
        reviewed: {
          vitalscan-rom: { users: reviewedPatients, pagination: {}, statusToRefresh: [] },
          rehab: { users: [], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
        pendingReview: {
          vitalscan-rom: { users: pendingPatients, pagination: {}, statusToRefresh: [] },
          rehab: { users: [], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
      } as unknown as Partial<ReduxState>);

      const result = selectAllActivePatients(state);
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ id: '1', status: 'new' });
      expect(result).toContainEqual({ id: '2', status: 'reviewed' });
      expect(result).toContainEqual({ id: '3', status: 'pending' });
    });
  });

  describe('selectActivePatientCount', () => {
    it('should count all active patients', () => {
      const state = createMockState({
        newPatients: {
          data: [{ id: '1' }, { id: '2' }],
          pagination: {},
        },
        reviewed: {
          vitalscan-rom: { users: [{ id: '3' }], pagination: {}, statusToRefresh: [] },
          rehab: { users: [{ id: '4' }], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
        pendingReview: {
          vitalscan-rom: { users: [{ id: '5' }], pagination: {}, statusToRefresh: [] },
          rehab: { users: [], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
      } as unknown as Partial<ReduxState>);

      const result = selectActivePatientCount(state);
      expect(result).toBe(5); // 2 new + 2 reviewed + 1 pending
    });
  });

  describe('selectPatientCountsByStatus', () => {
    it('should return counts for all statuses', () => {
      const state = createMockState({
        newPatients: {
          data: [{ id: '1' }, { id: '2' }],
          pagination: {},
        },
        reviewed: {
          vitalscan-rom: { users: [{ id: '3' }], pagination: {}, statusToRefresh: [] },
          rehab: { users: [], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
        pendingReview: {
          vitalscan-rom: { users: [{ id: '4' }], pagination: {}, statusToRefresh: [] },
          rehab: { users: [], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
        outOfParams: {
          vitalscan-rom: { users: [{ id: '5' }], pagination: {}, statusToRefresh: [] },
          rehab: { users: [], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
        escalationRequired: {
          vitalscan-rom: { users: [{ id: '6' }], pagination: {}, statusToRefresh: [] },
          rehab: { users: [], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
        followUpRequired: {
          vitalscan-rom: { users: [{ id: '7' }], pagination: {}, statusToRefresh: [] },
          rehab: { users: [], pagination: {}, statusToRefresh: [] },
          evaluation: { users: [], pagination: {}, statusToRefresh: [] },
          survey: { users: [], pagination: {}, statusToRefresh: [] },
          postures: { users: [], pagination: {}, statusToRefresh: [] },
        },
      } as unknown as Partial<ReduxState>);

      const result = selectPatientCountsByStatus(state);
      expect(result).toEqual({
        new: 2,
        reviewed: 1,
        pending: 1,
        outOfParams: 1,
        escalation: 1,
        followUp: 1,
        total: 4, // new + reviewed + pending
      });
    });
  });

  // Memoization tests
  describe('Memoization', () => {
    it('should memoize selectNewPatientsData', () => {
      const state = createMockState({
        newPatients: {
          data: [{ id: '1' }],
          pagination: {},
        },
      } as unknown as Partial<ReduxState>);

      const result1 = selectNewPatientsData(state);
      const result2 = selectNewPatientsData(state);

      expect(result1).toBe(result2); // Same reference = memoized
    });

    it('should recompute when dependency changes', () => {
      const state1 = createMockState({
        newPatients: {
          data: [{ id: '1' }],
          pagination: {},
        },
      } as unknown as Partial<ReduxState>);

      const state2 = createMockState({
        newPatients: {
          data: [{ id: '2' }],
          pagination: {},
        },
      } as unknown as Partial<ReduxState>);

      const result1 = selectNewPatientsData(state1);
      const result2 = selectNewPatientsData(state2);

      expect(result1).not.toBe(result2); // Different reference = recomputed
    });
  });
});
