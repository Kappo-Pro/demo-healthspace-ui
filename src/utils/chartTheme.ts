/**
 * Chart Theme Utilities
 *
 * Provides theme-aware configurations for Ant Design Charts (@ant-design/plots)
 * that automatically adapt to light/dark mode using CSS custom properties.
 *
 * Usage:
 * ```tsx
 * import { getChartTheme } from '@utils/chartTheme';
 *
 * const Chart = () => {
 *   const config = {
 *     data: myData,
 *     xField: 'category',
 *     yField: 'value',
 *     ...getChartTheme(), // Applies theme-aware colors
 *   };
 *
 *   return <Column {...config} />;
 * };
 * ```
 */

/**
 * Get CSS custom property value
 */
function getCSSVar(varName: string): string {
  if (typeof window === 'undefined') return '';

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();

  return value;
}

/**
 * Get chart color palette based on current theme
 * Returns an array of colors suitable for multi-series charts
 * Uses design system chart tokens for consistent data visualization
 */
export function getChartColorPalette(): string[] {
  return [
    getCSSVar('--chart-series-1') || getCSSVar('--brand-primary'),
    getCSSVar('--chart-series-2') || getCSSVar('--color-success-500'),
    getCSSVar('--chart-series-3') || getCSSVar('--color-warning-500'),
    getCSSVar('--chart-series-4') || getCSSVar('--color-warning-600'),
    getCSSVar('--chart-series-5') || getCSSVar('--brand-secondary'),
    getCSSVar('--chart-series-6') || getCSSVar('--color-info-500'),
    getCSSVar('--color-purple-500'),
    getCSSVar('--color-lime-500'),
  ];
}

/**
 * Get theme-aware chart configuration
 * Includes axis styles, grid styles, tooltip styles, etc.
 * All colors use design system tokens for theme consistency
 */
export function getChartTheme() {
  const textColor = getCSSVar('--text-primary');
  const textSecondary = getCSSVar('--text-secondary');
  const borderColor = getCSSVar('--border-subtle');
  const surfacePrimary = getCSSVar('--surface-elevated');

  return {
    // Color palette
    color: getChartColorPalette(),

    // Axis configuration
    xAxis: {
      label: {
        style: {
          fill: textSecondary,
          fontSize: 12,
        },
      },
      title: {
        style: {
          fill: textColor,
          fontSize: 14,
          fontWeight: 'var(--font-weight-medium)',
        },
      },
      line: {
        style: {
          stroke: borderColor,
          lineWidth: 1,
        },
      },
      tickLine: {
        style: {
          stroke: borderColor,
          lineWidth: 1,
        },
      },
      grid: {
        line: {
          style: {
            stroke: borderColor,
            lineWidth: 1,
            lineDash: [4, 4],
            opacity: 0.5,
          },
        },
      },
    },

    yAxis: {
      label: {
        style: {
          fill: textSecondary,
          fontSize: 12,
        },
      },
      title: {
        style: {
          fill: textColor,
          fontSize: 14,
          fontWeight: 'var(--font-weight-medium)',
        },
      },
      line: {
        style: {
          stroke: borderColor,
          lineWidth: 1,
        },
      },
      tickLine: {
        style: {
          stroke: borderColor,
          lineWidth: 1,
        },
      },
      grid: {
        line: {
          style: {
            stroke: borderColor,
            lineWidth: 1,
            lineDash: [4, 4],
            opacity: 0.5,
          },
        },
      },
    },

    // Legend configuration
    legend: {
      itemName: {
        style: {
          fill: textColor,
          fontSize: 12,
        },
      },
    },

    // Tooltip configuration
    tooltip: {
      domStyles: {
        'g2-tooltip': {
          backgroundColor: surfacePrimary,
          color: textColor,
          boxShadow: getCSSVar('--shadow-lg'),
          borderRadius: getCSSVar('--radius-lg'),
          padding: getCSSVar('--spacing-3'),
          border: `1px solid ${borderColor}`,
        },
        'g2-tooltip-title': {
          color: textColor,
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--spacing-2)',
        },
        'g2-tooltip-list-item': {
          color: textSecondary,
          fontSize: 'var(--font-size-xs)',
        },
      },
    },

    // Annotations
    annotations: [] as unknown[],
  };
}

/**
 * Get theme-aware radar chart configuration
 * Includes specific styling for radar/spider charts
 * Uses design system tokens for theme consistency
 */
export function getRadarChartTheme() {
  const baseTheme = getChartTheme();
  const borderColor = getCSSVar('--border-subtle');
  const surfaceSecondary = getCSSVar('--surface-secondary');

  return {
    ...baseTheme,
    xAxis: {
      ...baseTheme.xAxis,
      line: null,
      tickLine: null,
      grid: null,
    },
    yAxis: {
      label: null,
      line: null,
      tickLine: null,
      grid: {
        lineStyle: {
          lineDash: null,
          stroke: borderColor,
        },
        alternateColor: surfaceSecondary,
      },
    },
    // Radar-specific area styling
    area: {
      style: {
        fillOpacity: 0.5,
      },
    },
    // Radar-specific point styling
    point: {
      size: 3,
      shape: 'circle',
      style: {
        fill: getCSSVar('--brand-primary'),
        stroke: getCSSVar('--surface-primary'),
        lineWidth: 2,
      },
    },
  };
}

/**
 * Get theme-aware pie/donut chart configuration
 * Uses design system tokens for theme consistency
 */
export function getPieChartTheme() {
  const baseTheme = getChartTheme();
  const textColor = getCSSVar('--text-primary');

  return {
    ...baseTheme,
    // Pie chart label styling
    label: {
      type: 'spider',
      style: {
        fill: textColor,
        fontSize: 12,
      },
    },
    // Statistic (center text for donut charts)
    statistic: {
      title: {
        style: {
          fill: textColor,
          fontSize: 14,
        },
      },
      content: {
        style: {
          fill: textColor,
          fontSize: 24,
          fontWeight: 'bold',
        },
      },
    },
  };
}

/**
 * Get theme-aware heatmap configuration
 * Uses design system tokens for theme consistency
 */
export function getHeatmapTheme() {
  const baseTheme = getChartTheme();
  const brandPrimary = getCSSVar('--brand-primary');
  const surfaceSecondary = getCSSVar('--surface-secondary');

  return {
    ...baseTheme,
    // Heatmap color scale
    color: [surfaceSecondary, brandPrimary],
  };
}

/**
 * Refresh chart theme when theme changes
 * Call this function after theme switching to update all charts
 */
export function refreshChartTheme() {
  // Trigger a re-render by updating a custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('themechange'));
  }
}
