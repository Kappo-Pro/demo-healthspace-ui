/**
 * TrendIndicator Component Types
 *
 * Defines the props interface for the TrendIndicator atom component.
 */

export interface TrendIndicatorProps {
  /**
   * The percentage change value (-100 to +100)
   * Positive values show upward trend (green)
   * Negative values show downward trend (red)
   * Zero shows neutral trend (gray)
   */
  value: number;
}
