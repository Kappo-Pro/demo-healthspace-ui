/**
 * TrendIndicator Atom Component
 *
 * Displays trend direction (up/down/neutral) with color-coded arrows
 * and percentage values for metric changes.
 *
 * Features:
 * - Positive trends (>0): Green with ↑ arrow
 * - Negative trends (<0): Red with ↓ arrow
 * - Neutral trends (=0): Gray with — symbol
 * - Percentage formatted to 1 decimal place
 *
 * Usage:
 * ```tsx
 * <TrendIndicator value={5.234} />   // +5.2% (green, up arrow)
 * <TrendIndicator value={-3.1} />    // -3.1% (red, down arrow)
 * <TrendIndicator value={0} />       // 0.0% (gray, neutral)
 * ```
 */

import React from 'react';
import { UntitledIcon } from '@atoms/Icon';
import { TrendIndicatorProps } from './types';
import './TrendIndicator.css';

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value }) => {
  /**
   * Get color based on trend direction
   * Uses design system CSS custom properties
   */
  const getTrendColor = (): string => {
    if (value > 0) return 'var(--color-success-600)';
    if (value < 0) return 'var(--color-error-600)';
    return 'var(--text-tertiary)';
  };

  /**
   * Get icon based on trend direction
   */
  const getTrendIcon = (): React.ReactNode => {
    if (value > 0) return <UntitledIcon name="arrowUp" size={12} />;
    if (value < 0) return <UntitledIcon name="arrowDown" size={12} />;
    return <span>—</span>;
  };

  // Format percentage to 1 decimal place
  const formattedValue = Math.abs(value).toFixed(1);

  // Add +/- prefix for non-zero values
  const prefix = value > 0 ? '+' : value < 0 ? '-' : '';

  return (
    <div className="trend-indicator" style={{ color: getTrendColor() }}>
      {getTrendIcon()}
      <span className="trend-value">
        {prefix}{formattedValue}%
      </span>
    </div>
  );
};

export default TrendIndicator;
