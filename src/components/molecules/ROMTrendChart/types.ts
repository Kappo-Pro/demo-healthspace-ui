/**
 * ROMTrendChart Types
 *
 * Type definitions for the ROMTrendChart molecule component
 */

/**
 * ROM Data Point
 *
 * Represents a single data point in the ROM trend chart
 */
export interface ROMDataPoint {
	/** ISO date string */
	date: string;

	/** ROM score value (0-100) */
	score: number;
}

/**
 * ROMTrendChart Props Interface
 *
 * Props for rendering the ROM trend chart
 */
export interface ROMTrendChartProps {
	/** Array of ROM data points to display */
	data: ROMDataPoint[];

	/** Optional loading state */
	loading?: boolean;

	/** Optional height for the chart (default: 300) */
	height?: number;

	/** Optional additional CSS class */
	className?: string;
}
