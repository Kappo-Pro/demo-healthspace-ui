/**
 * ROMTrendChart - Molecule Component
 *
 * Displays ROM (Range of Motion) score trends over time using Recharts LineChart.
 * Features responsive sizing, hover tooltips, design system theming, and graceful
 * empty state handling.
 *
 * EPIC-021-S1: ROM Trend Chart Molecule
 */

import React from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	TooltipProps} from 'recharts';
import { Empty, Spin } from 'antd';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ROMTrendChartProps } from './types';
import './ROMTrendChart.css';

/**
 * Formatted data point for Recharts
 */
interface FormattedDataPoint {
	date: string;
	score: number;
	fullDate: string;
}

/**
 * Custom Tooltip Component
 *
 * Displays date and score when hovering over data points
 */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
	active,
	payload,
}) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload as FormattedDataPoint;
		return (
			<div className="rom-trend-tooltip">
				<p className="tooltip-date">
					{format(new Date(data.fullDate), 'MMM d, yyyy')}
				</p>
				<p className="tooltip-score">
					Score: <strong>{data.score}</strong>
				</p>
			</div>
		);
	}
	return null;
};

/**
 * ROMTrendChart Component
 *
 * Renders a line chart showing ROM score trends over a 3-month period.
 * Uses design system tokens for consistent theming and supports responsive sizing.
 *
 * @component
 * @example
 * ```tsx
 * <ROMTrendChart
 *   data={[
 *     { date: '2025-10-01', score: 75 },
 *     { date: '2025-10-15', score: 82 },
 *     { date: '2025-10-21', score: 88 }
 *   ]}
 * />
 * ```
 */
export const ROMTrendChart: React.FC<ROMTrendChartProps> = ({
	data,
	loading = false,
	height = 300,
	className,
}) => {
	const { t } = useTranslation();

	/**
	 * Loading State
	 */
	if (loading) {
		return (
			<div className={`rom-trend-chart-loading ${className || ''}`}>
				<Spin size="large" tip="Loading chart..." />
			</div>
		);
	}

	/**
	 * Empty State
	 */
	if (!data || data.length === 0) {
		return (
			<div className={`rom-trend-chart-empty ${className || ''}`}>
				<Empty
					description={t('Patient.data.vitalscan-rom.noRomDataAvailable')}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			</div>
		);
	}

	/**
	 * Format data for Recharts
	 * Converts ISO dates to short format for X-axis display
	 */
	const formattedData: FormattedDataPoint[] = data.map((point) => ({
		date: format(new Date(point.date), 'MMM d'),
		score: point.score,
		fullDate: point.date,
	}));

	return (
		<div className={`rom-trend-chart ${className || ''}`}>
			<ResponsiveContainer width="100%" height={height}>
				<LineChart
					data={formattedData}
					margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="var(--border-subtle)"
					/>
					<XAxis
						dataKey="date"
						stroke="var(--text-secondary)"
						style={{ fontSize: 'var(--font-size-xs)' }}
						tick={{ fill: 'var(--text-secondary)' }}
					/>
					<YAxis
						domain={[0, 100]}
						stroke="var(--text-secondary)"
						style={{ fontSize: 'var(--font-size-xs)' }}
						tick={{ fill: 'var(--text-secondary)' }}
						label={{
							value: 'ROM Score',
							angle: -90,
							position: 'insideLeft',
							style: {
								textAnchor: 'middle',
								fill: 'var(--text-secondary)',
								fontSize: 'var(--font-size-xs)',
							},
						}}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Line
						type="monotone"
						dataKey="score"
						stroke="var(--brand-primary)"
						strokeWidth={2}
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
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

ROMTrendChart.displayName = 'ROMTrendChart';
