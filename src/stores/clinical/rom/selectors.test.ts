import { selectROMState, selectLatestROM, selectROMScore } from './selectors';
import { ReduxState } from '@stores/index';
import { Session, RomInitialState } from '@types';

/**
 * Unit tests for ROM Redux selectors
 * Tests cover: memoization, null handling, data access patterns
 */

describe('ROM Selectors', () => {
  describe('selectROMState', () => {
    it('should return the ROM main state', () => {
      const mockROMState = {
        session: null,
        loading: false,
        exercises: null,
      } as unknown as RomInitialState;

      const mockState = {
        rom: {
          main: mockROMState,
        },
      } as unknown as ReduxState;

      const result = selectROMState(mockState);

      expect(result).toBe(mockROMState);
      expect(result).toHaveProperty('session');
    });
  });

  describe('selectLatestROM', () => {
    it('should return session when it exists', () => {
      const mockSession: Session = {
        id: 'session-123',
        userId: 'user-456',
        createdAt: new Date('2025-10-20'),
        status: 'completed',
        customRomId: 'rom-789',
        customRomExerciseId: 'exercise-101',
        customRomSessionExercise: [],
        surveyResult: [],
        programSession: [],
        strapiOmniRomExerciseGroup: {
          id: 1,
          name: 'Test Group',
        } as unknown,
      };

      const mockState = {
        rom: {
          main: {
            session: mockSession,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result = selectLatestROM(mockState);

      expect(result).toBe(mockSession);
      expect(result?.id).toBe('session-123');
      expect(result?.userId).toBe('user-456');
    });

    it('should return null when session does not exist', () => {
      const mockState = {
        rom: {
          main: {
            session: null,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result = selectLatestROM(mockState);

      expect(result).toBeNull();
    });

    it('should handle undefined session gracefully', () => {
      const mockState = {
        rom: {
          main: {
            session: undefined,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result = selectLatestROM(mockState);

      expect(result).toBeUndefined();
    });

    it('should be memoized (returns same reference for same input)', () => {
      const mockSession: Session = {
        id: 'session-123',
        userId: 'user-456',
        createdAt: new Date('2025-10-20'),
        status: 'completed',
        customRomId: 'rom-789',
        customRomExerciseId: 'exercise-101',
        customRomSessionExercise: [],
        surveyResult: [],
        programSession: [],
        strapiOmniRomExerciseGroup: { id: 1 } as unknown,
      };

      const mockState = {
        rom: {
          main: {
            session: mockSession,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result1 = selectLatestROM(mockState);
      const result2 = selectLatestROM(mockState);

      // Same reference = memoized
      expect(result1).toBe(result2);
    });
  });

  describe('selectROMScore', () => {
    it('should return null when session is null', () => {
      const mockState = {
        rom: {
          main: {
            session: null,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result = selectROMScore(mockState);

      expect(result).toBeNull();
    });

    it('should return null when session is undefined', () => {
      const mockState = {
        rom: {
          main: {
            session: undefined,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result = selectROMScore(mockState);

      expect(result).toBeNull();
    });

    it('should return placeholder score when session exists', () => {
      const mockSession: Session = {
        id: 'session-123',
        userId: 'user-456',
        createdAt: new Date('2025-10-20'),
        status: 'completed',
        customRomId: 'rom-789',
        customRomExerciseId: 'exercise-101',
        customRomSessionExercise: [
          {
            id: 'exercise-1',
            customRomId: 'rom-789',
            completed: true,
          } as unknown,
        ],
        surveyResult: [],
        programSession: [],
        strapiOmniRomExerciseGroup: { id: 1 } as unknown,
      };

      const mockState = {
        rom: {
          main: {
            session: mockSession,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result = selectROMScore(mockState);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('trend');

      // Placeholder implementation returns {value: 0, trend: 0}
      expect(result?.value).toBe(0);
      expect(result?.trend).toBe(0);
    });

    it('should return score object with correct shape', () => {
      const mockSession: Session = {
        id: 'session-123',
        userId: 'user-456',
        createdAt: new Date('2025-10-20'),
        status: 'completed',
        customRomId: 'rom-789',
        customRomExerciseId: 'exercise-101',
        customRomSessionExercise: [],
        surveyResult: [],
        programSession: [],
        strapiOmniRomExerciseGroup: { id: 1 } as unknown,
      };

      const mockState = {
        rom: {
          main: {
            session: mockSession,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result = selectROMScore(mockState);

      expect(result).toEqual({
        value: expect.any(Number),
        trend: expect.any(Number),
      });
    });

    it('should be memoized (returns same reference for same session)', () => {
      const mockSession: Session = {
        id: 'session-123',
        userId: 'user-456',
        createdAt: new Date('2025-10-20'),
        status: 'completed',
        customRomId: 'rom-789',
        customRomExerciseId: 'exercise-101',
        customRomSessionExercise: [],
        surveyResult: [],
        programSession: [],
        strapiOmniRomExerciseGroup: { id: 1 } as unknown,
      };

      const mockState = {
        rom: {
          main: {
            session: mockSession,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result1 = selectROMScore(mockState);
      const result2 = selectROMScore(mockState);

      // Same reference = memoized
      expect(result1).toBe(result2);
    });

    it('should handle empty customRomSessionExercise array', () => {
      const mockSession: Session = {
        id: 'session-123',
        userId: 'user-456',
        createdAt: new Date('2025-10-20'),
        status: 'completed',
        customRomId: 'rom-789',
        customRomExerciseId: 'exercise-101',
        customRomSessionExercise: [], // Empty array
        surveyResult: [],
        programSession: [],
        strapiOmniRomExerciseGroup: { id: 1 } as unknown,
      };

      const mockState = {
        rom: {
          main: {
            session: mockSession,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const result = selectROMScore(mockState);

      expect(result).not.toBeNull();
      expect(result?.value).toBe(0);
      expect(result?.trend).toBe(0);
    });
  });

  describe('Selector Integration', () => {
    it('should work together in a component usage pattern', () => {
      const mockSession: Session = {
        id: 'session-abc',
        userId: 'user-xyz',
        createdAt: new Date('2025-10-20'),
        status: 'in-progress',
        customRomId: 'rom-123',
        customRomExerciseId: 'exercise-456',
        customRomSessionExercise: [],
        surveyResult: [],
        programSession: [],
        strapiOmniRomExerciseGroup: { id: 1 } as unknown,
      };

      const mockState = {
        rom: {
          main: {
            session: mockSession,
            loading: false,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      // Simulate component usage
      const session = selectLatestROM(mockState);
      const score = selectROMScore(mockState);

      expect(session).toBeTruthy();
      expect(score).toBeTruthy();
      expect(session?.id).toBe('session-abc');
      expect(score?.value).toBe(0); // Placeholder
    });

    it('should handle complete null state gracefully', () => {
      const mockState = {
        rom: {
          main: {
            session: null,
            loading: false,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const session = selectLatestROM(mockState);
      const score = selectROMScore(mockState);

      expect(session).toBeNull();
      expect(score).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('should maintain correct TypeScript types', () => {
      const mockState = {
        rom: {
          main: {
            session: null,
          } as unknown as RomInitialState,
        },
      } as unknown as ReduxState;

      const session = selectLatestROM(mockState);
      const score = selectROMScore(mockState);

      // Type checks - verify correct types are returned
      expect(typeof session === 'object' || session === null || session === undefined).toBe(true);
      expect(typeof score === 'object' || score === null).toBe(true);

      // Compile-time type safety validation (no runtime impact)
      void (session satisfies Session | null | undefined);
      void (score satisfies { value: number; trend: number } | null);
    });
  });
});
