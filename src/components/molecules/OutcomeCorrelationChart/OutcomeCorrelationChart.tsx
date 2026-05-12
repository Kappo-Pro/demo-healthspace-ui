/**
 * OutcomeCorrelationChart - Molecule Component
 *
 * Displays dual-axis correlation chart between posture scores and clinical outcomes (FR17).
 * Features:
 * - Recharts ComposedChart with two Y-axes
 * - Line chart for posture score (left axis)
 * - Line chart for outcome measure (right axis)
 * - Statistical correlation display
 * - Responsive design with design system theming
 *
 * Story 3.5: Clinical Outcome Integration
 */

import React from 'react';
import {
	ComposedChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	TooltipProps} from 'recharts';
import { Empty, Spin, Typography, Tag } from 'antd';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { OutcomeCorrelationChartProps } from './types';
import './OutcomeCorrelationChart.css';

const { Text } = Typography;

/**
 * Formatted data point for Recharts
 */
interface FormattedDataPoint {
	date: string;
	postureScore: number;
	outcomeValue: number;
	fullDate: string;
}

/**
 * Custom Tooltip Component
 *
 * Displays date, posture score, and outcome value
 */
const CustomTooltip: React.FC<
	TooltipProps<number, string> & { measureLabel: string; measureType: string }
> = ({ active, payload, measureLabel, measureType }) => {
	if (active && payload && payload.length >= 2) {
		const data = payload[0].payload as FormattedDataPoint;
		return (
			<div className="outcome-correlation-tooltip">
				<p className="tooltip-date">
					{format(new Date(data.fullDate), 'MMM d, yyyy')}
				</p>
				<p className="tooltip-posture">
					Posture: <strong>{data.postureScore}</strong>/100
				</p>
				<p className="tooltip-outcome">
					{measureLabel}: <strong>{data.outcomeValue}</strong>
					{measureType === 'NPRS' ? '/10' : '%'}
				</p>
			</div>
		);
	}
	return null;
};

/**
 * Get color for correlation strength
 */
const getCorrelationColor = (interpretation: string): string => {
	if (interpretation.includes('strong')) return 'var(--status-success)';
	if (interpretation.includes('moderate')) return 'var(--status-warning)';
	return 'var(--text-secondary)';
};

/**
 * OutcomeCorrelationChart Component
 *
 * Renders a dual-axis line chart showing correlation between posture scores
 * and clinical outcome measures over time.
 *
 * @component
 * @example
 * ```tsx
 * <OutcomeCorrelationChart
 *   correlation={correlationData}
 *   measureType="NPRS"
 *   measureLabel="Pain Level"
 * />
 * ```
 */
export const OutcomeCorrelationChart: React.FC<
	OutcomeCorrelationChartProps
> = ({
	correlation,
	measureType,
	measureLabel,
	loading = false,
	height = 350,
	className,
}) => {
	const { t } = useTranslation();

	/**
	 * Loading State
	 */
	if (loading) {
		return (
			<div className={`outcome-correlation-chart-loading ${className || ''}`}>
				<Spin size="large" tip="Loading correlation chart..." />
			</div>
		);
	}

	/**
	 * Empty State
	 */
	if (
		!correlation ||
		!correlation.dataPoints ||
		correlation.dataPoints.length === 0
	) {
		return (
			<div className={`outcome-correlation-chart-empty ${className || ''}`}>
				<Empty
					description={t('Patient.data.charts.outcomeCorrelation.noCorrelationDataAvailable')}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			</div>
		);
	}

	/**
	 * Format data for Recharts
	 */
	const formattedData: FormattedDataPoint[] = correlation.dataPoints.map(
		point => ({
			date: format(new Date(point.date), 'MMM d'),
			postureScore: Math.round(point.postureScore * 10) / 10,
			outcomeValue: Math.round(point.outcomeValue * 10) / 10,
			fullDate: point.date,
		}),
	);

	/**
	 * Determine Y-axis domains
	 */
	const postureScores = formattedData.map(d => d.postureScore);
	const outcomeValues = formattedData.map(d => d.outcomeValue);

	const postureDomain: [number, number] = [
		Math.floor(Math.min(...postureScores) / 10) * 10,
		100,
	];

	const outcomeDomain: [number, number] =
		measureType === 'NPRS'
			? [0, 10]
			: [0, Math.ceil(Math.max(...outcomeValues) / 10) * 10];

	/**
	 * Correlation interpretation
	 */
	const correlationColor = getCorrelationColor(correlation.interpretation);

	return (
		<div className={`outcome-correlation-chart ${className || ''}`}>
			{/* Correlation Header */}
			<div className="correlation-header">
				<div className="correlation-stat">
					<Text type="secondary" className="stat-label">
						Correlation Coefficient
					</Text>
					<Text
						strong
						className="stat-value"
						style={{ color: correlationColor }}>
						r = {correlation.coefficient.toFixed(2)}
					</Text>
				</div>
				<div className="correlation-interpretation">
					<Tag
						color={
							correlation.isSignificant
								? correlation.interpretation.includes('strong')
									? 'success'
									: 'warning'
								: 'default'
						}>
						{correlation.interpretation.toUpperCase()}
					</Tag>
					{correlation.isSignificant && (
						<Text type="secondary" className="significance">
							p &lt; 0.05
						</Text>
					)}
				</div>
			</div>

			{/* Dual-Axis Chart */}
			<ResponsiveContainer width="100%" height={height}>
				<ComposedChart
					data={formattedData}
					margin={{ top: 20, right: 60, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
					<XAxis
						dataKey="date"
						stroke="var(--text-secondary)"
						style={{ fontSize: 12 }}
						tick={{ fill: 'var(--text-secondary)' }}
					/>

					{/* Left Y-axis: Posture Score */}
					<YAxis
						yAxisId="posture"
						domain={postureDomain}
						stroke="var(--brand-primary)"
						style={{ fontSize: 12 }}
						tick={{ fill: 'var(--brand-primary)' }}
						label={{
							value: 'Posture Score',
							angle: -90,
							position: 'insideLeft',
							style: {
								textAnchor: 'middle',
								fill: 'var(--brand-primary)',
								fontSize: 12,
							},
						}}
					/>

					{/* Right Y-axis: Outcome Measure */}
					<YAxis
						yAxisId="outcome"
						orientation="right"
						domain={outcomeDomain}
						stroke="var(--status-error)"
						style={{ fontSize: 12 }}
						tick={{ fill: 'var(--status-error)' }}
						label={{
							value: measureLabel,
							angle: 90,
							position: 'insideRight',
							style: {
								textAnchor: 'middle',
								fill: 'var(--status-error)',
								fontSize: 12,
							},
						}}
					/>

					<Tooltip
						content={
							<CustomTooltip
								measureLabel={measureLabel}
								measureType={measureType}
							/>
						}
					/>

					<Legend
						wrapperStyle={{
							paddingTop: 'var(--spacing-2-5)',
							fontSize: 'var(--font-size-xs)',
						}}
					/>

					{/* Posture Score Line */}
					<Line
						yAxisId="posture"
						type="monotone"
						dataKey="postureScore"
						stroke="var(--brand-primary)"
						strokeWidth={2}
						name="Posture Score"
						dot={{
							fill: 'var(--brand-primary)',
							r: 4,
							strokeWidth: 2,
							stroke: 'var(--surface-elevated)',
						}}
						activeDot={{
							r: 6,
							fill: 'var(--brand-primary-hover)',
						}}
					/>

					{/* Outcome Measure Line */}
					<Line
						yAxisId="outcome"
						type="monotone"
						dataKey="outcomeValue"
						stroke="var(--status-error)"
						strokeWidth={2}
						name={measureLabel}
						dot={{
							fill: 'var(--status-error)',
							r: 4,
							strokeWidth: 2,
							stroke: 'var(--surface-elevated)',
						}}
						activeDot={{
							r: 6,
							fill: 'var(--status-error-hover)',
						}}
					/>
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
};

OutcomeCorrelationChart.displayName = 'OutcomeCorrelationChart';
