/**
 * ProgressChart Component
 *
 * Timeline and chart visualizations for measurement progress tracking.
 * Displays trends over multiple measurement sessions.
 *
 * @module organisms/OBodyModel3D
 * @since EPIC-001-S13
 */

import React, { useMemo } from 'react';
import { Card, Select, Empty } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import type { ProgressEntry } from './types/annotations';

/**
 * Progress Chart Props
 */
export interface ProgressChartProps {
	/** Progress entries (chronological order) */
	entries: ProgressEntry[];

	/** Optional measurement ID to track (default: all) */
	measurementId?: string;
}

const Container = styled(Card)`
	.ant-card-head {
		background: var(--background-secondary);
		border-bottom: 1px solid var(--border-color);
	}

	.ant-card-body {
		padding: var(--spacing-lg);
		min-height: 400px;
	}
`;

const Controls = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--spacing-md);
`;

const ChartContainer = styled.div`
	margin-top: var(--spacing-md);
`;

const StatsRow = styled.div`
	display: flex;
	justify-content: space-around;
	padding: var(--spacing-md);
	background: var(--background-tertiary);
	border-radius: var(--border-radius-md);
	margin-bottom: var(--spacing-md);
`;

const StatItem = styled.div`
	text-align: center;
`;

const StatLabel = styled.div`
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
	margin-bottom: var(--spacing-xs);
`;

const StatValue = styled.div<{ $color?: string }>`
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: ${props => props.$color || 'var(--text-color-root)'};
`;

/**
 * Progress Chart Component
 *
 * Implements AC4: progress tracking visualizations (timeline, charts).
 *
 * @param props - Component props
 */
export const ProgressChart: React.FC<ProgressChartProps> = ({ entries, measurementId }) => {
	const [selectedMetric, setSelectedMetric] = React.useState<string>('symmetryScore');

	// Extract available measurements from entries
	const availableMetrics = useMemo(() => {
		if (entries.length === 0) return [];

		const metrics = new Set<string>();
		metrics.add('symmetryScore');

		entries[0].result.measurements.segments.forEach(s => {
			metrics.add(`segment-${s.segment}`);
		});

		entries[0].result.measurements.circumferences.forEach(c => {
			metrics.add(`circ-${c.bodyPart}`);
		});

		return Array.from(metrics);
	}, [entries]);

	// Prepare chart data
	const chartData = useMemo(() => {
		return entries.map(entry => {
			const date = new Date(entry.date).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			});

			let value: number;

			if (selectedMetric === 'symmetryScore') {
				value = entry.result.metadata.symmetryScore;
			} else if (selectedMetric.startsWith('segment-')) {
				const segmentName = selectedMetric.replace('segment-', '');
				const segment = entry.result.measurements.segments.find(s => s.segment === segmentName);
				value = segment?.lengthCm || 0;
			} else if (selectedMetric.startsWith('circ-')) {
				const bodyPart = selectedMetric.replace('circ-', '');
				const circ = entry.result.measurements.circumferences.find(c => c.bodyPart === bodyPart);
				value = circ?.circumferenceCm || 0;
			} else {
				value = 0;
			}

			return {
				date,
				value,
				score: entry.score,
			};
		});
	}, [entries, selectedMetric]);

	// Calculate stats
	const stats = useMemo(() => {
		if (chartData.length < 2) return null;

		const firstValue = chartData[0].value;
		const lastValue = chartData[chartData.length - 1].value;
		const change = lastValue - firstValue;
		const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;

		const avgScore = chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length;

		return {
			firstValue,
			lastValue,
			change,
			percentChange,
			avgScore,
		};
	}, [chartData]);

	if (entries.length === 0) {
		return (
			<Container title={<><UntitledIcon name="trending" /> Progress Tracking</>}>
				<Empty description="No progress data available" />
			</Container>
		);
	}

	return (
		<Container
			title={
				<>
					<UntitledIcon name="trending" /> Progress Tracking
				</>
			}
		>
			<Controls>
				<Select
					style={{ width: 300 }}
					value={selectedMetric}
					onChange={setSelectedMetric}
					placeholder="Select metric to track"
				>
					<Select.Option value="symmetryScore">
						<UntitledIcon name="balance" size="xsmall" /> Overall Symmetry Score
					</Select.Option>
					{availableMetrics
						.filter(m => m !== 'symmetryScore')
						.map(metric => (
							<Select.Option key={metric} value={metric}>
								{formatMetricLabel(metric)}
							</Select.Option>
						))}
				</Select>
			</Controls>

			{/* Stats Summary */}
			{stats && (
				<StatsRow>
					<StatItem>
						<StatLabel>Starting Value</StatLabel>
						<StatValue>{stats.firstValue.toFixed(1)}</StatValue>
					</StatItem>

					<StatItem>
						<StatLabel>Current Value</StatLabel>
						<StatValue>{stats.lastValue.toFixed(1)}</StatValue>
					</StatItem>

					<StatItem>
						<StatLabel>Total Change</StatLabel>
						<StatValue
							$color={
								stats.percentChange > 0
									? 'var(--success-500)'
									: stats.percentChange < 0
										? 'var(--error-500)'
										: 'var(--gray-500)'
							}
						>
							{stats.percentChange > 0 ? '+' : ''}
							{stats.percentChange.toFixed(1)}%
						</StatValue>
					</StatItem>

					<StatItem>
						<StatLabel>Avg Progress Score</StatLabel>
						<StatValue $color="var(--brand-primary)">{stats.avgScore.toFixed(0)}/100</StatValue>
					</StatItem>
				</StatsRow>
			)}

			{/* Chart */}
			<ChartContainer>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
						<XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: 12 }} />
						<YAxis stroke="var(--text-secondary)" style={{ fontSize: 12 }} />
						<Tooltip
							contentStyle={{
								background: 'var(--background-secondary)',
								border: '1px solid var(--border-color)',
								borderRadius: 'var(--border-radius-md)',
							}}
						/>
						<Legend />
						<Line
							type="monotone"
							dataKey="value"
							stroke="var(--brand-primary)"
							strokeWidth={2}
							dot={{ fill: 'var(--brand-primary)', r: 4 }}
							activeDot={{ r: 6 }}
							name={formatMetricLabel(selectedMetric)}
						/>
					</LineChart>
				</ResponsiveContainer>
			</ChartContainer>
		</Container>
	);
};

/**
 * Format metric label for display
 *
 * @internal
 */
function formatMetricLabel(metric: string): string {
	if (metric === 'symmetryScore') {
		return 'Symmetry Score';
	}

	if (metric.startsWith('segment-')) {
		const name = metric.replace('segment-', '');
		return formatName(name);
	}

	if (metric.startsWith('circ-')) {
		const name = metric.replace('circ-', '');
		return `${formatName(name)} Circumference`;
	}

	return metric;
}

/**
 * Format name (kebab-case → Title Case)
 *
 * @internal
 */
function formatName(name: string): string {
	return name
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export default ProgressChart;
