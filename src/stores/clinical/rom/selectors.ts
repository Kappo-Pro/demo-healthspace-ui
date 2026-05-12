import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '@stores/index';
import { Session } from '@types';

/**
 * Base selector to access the ROM main state
 * @param state - Redux root state
 * @returns ROM main state object
 */
export const selectROMState = (state: ReduxState) => state.rom.main;

/**
 * Memoized selector to get the latest ROM session
 * Returns null if no session exists
 *
 * @example
 * const session = useTypedSelector(selectLatestROM);
 * if (session) {
 *    * }
 */
export const selectLatestROM = createSelector(
  [selectROMState],
  (romState) => romState.session
);

/**
 * ROM Score data structure
 */
export interface ROMScore {
  /** Numeric score value (0-100 range typical) */
  value: number;
  /** Trend indicator: positive = improving, negative = declining, 0 = stable */
  trend: number;
}

/**
 * Memoized selector to calculate ROM score from session data
 * Returns null if no session exists
 *
 * NOTE: This is a placeholder implementation.
 * Actual scoring logic to be implemented in future story.
 *
 * TODO: Implement actual ROM scoring calculation based on:
 * - session.customRomSessionExercise array
 * - Exercise completion rates
 * - Range of motion measurements
 * - Historical comparison for trend calculation
 *
 * @example
 * const score = useTypedSelector(selectROMScore);
 * if (score) {
 *    * }
 */
export const selectROMScore = createSelector(
  [selectLatestROM],
  (session: Session | null): ROMScore | null => {
    if (!session) {
      return null;
    }

    // Placeholder implementation
    // Future: Calculate actual score from session.customRomSessionExercise
    return {
      value: 0,
      trend: 0,
    };
  }
);
