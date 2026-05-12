/**
 * OutcomeCorrelationChart Types
 *
 * Type definitions for the clinical outcome correlation chart component (FR17).
 *
 * @module components/molecules/OutcomeCorrelationChart/types
 */

import type {
	CorrelationData,
	OutcomeMeasureType,
} from '@types/clinicalOutcomes';

/**
 * Outcome Correlation Chart Props
 */
export interface OutcomeCorrelationChartProps {
	/** Correlation data to display */
	correlation: CorrelationData;

	/** Outcome measure type */
	measureType: OutcomeMeasureType;

	/** Measure label (e.g., "Pain Level", "Neck Disability") */
	measureLabel: string;

	/** Loading state */
	loading?: boolean;

	/** Chart height in pixels */
	height?: number;

	/** Additional CSS class name */
	className?: string;
}
