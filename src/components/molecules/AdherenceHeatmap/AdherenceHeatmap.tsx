/**
 * AdherenceHeatmap Molecule Component
 *
 * Calendar heatmap visualization for exercise adherence tracking.
 * Color-coded: green (high adherence), yellow (medium), red (low), gray (none).
 *
 * Story 3.7: Patient Adherence Tracking (FR28)
 * @module components/molecules/AdherenceHeatmap
 */

import React, { useMemo } from 'react';
import { Card, Typography, Space, Tooltip } from 'antd';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	Cell,
	Legend} from 'recharts';
import type {
	DailyAdherence,
	WeeklyAdherence} from '@stores/posture/postureAnalytics/exerciseTracking';
import {
	format,
	parseISO,
	endOfWeek,
	eachDayOfInterval,
	eachWeekOfInterval,
	isSameDay} from 'date-fns';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './AdherenceHeatmap.css';

const { Title, Text } = Typography;

export interface AdherenceHeatmapProps {
	/** Daily adherence data */
	dailyData: DailyAdherence[];
	/** Weekly adherence data */
	weeklyData: WeeklyAdherence[];
	/** Loading state */
	loading?: boolean;
	/** Number of weeks to display (default: 12) */
	weeksToDisplay?: number;
	/** Show legend */
	showLegend?: boolean;
}

/**
 * Get color for adherence level
 */
const getAdherenceColor = (level: number): string => {
	if (level >= 0.8) return 'var(--color-success)'; // High adherence (green)
	if (level >= 0.5) return 'var(--color-warning)'; // Medium adherence (yellow)
	if (level > 0) return 'var(--color-error)'; // Low adherence (red)
	return 'var(--color-text-tertiary)'; // No activity (gray)
};

/**
 * Get color name for accessibility
 */
const getAdherenceColorName = (
	level: number,
	t: (key: string) => string,
): string => {
	if (level >= 0.8) return t('patient.adherence.heatmap.highAdherence');
	if (level >= 0.5) return t('patient.adherence.heatmap.mediumAdherence');
	if (level > 0) return t('patient.adherence.heatmap.lowAdherence');
	return t('patient.adherence.heatmap.noActivity');
};

export const AdherenceHeatmap: React.FC<AdherenceHeatmapProps> = ({
	dailyData,
	weeklyData,
	loading = false,
	weeksToDisplay = 12,
	showLegend = true,
}) => {
	const { t } = useTypedTranslation();

	// Generate calendar grid for past N weeks
	const calendarGrid = useMemo(() => {
		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - weeksToDisplay * 7);

		const weeks = eachWeekOfInterval(
			{ start: startDate, end: today },
			{ weekStartsOn: 0 }, // Sunday
		);

		return weeks.map(weekStart => {
			const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
			const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

			return {
				weekStart,
				days: daysInWeek.map(day => {
					const dayData = dailyData.find(d => isSameDay(parseISO(d.date), day));
					return {
						date: day,
						data: dayData,
					};
				}),
			};
		});
	}, [dailyData, weeksToDisplay]);

	// Format weekly data for chart
	const weeklyChartData = useMemo(() => {
		return weeklyData.slice(-8).map(week => ({
			week: format(parseISO(week.weekStart), 'MMM dd'),
			completed: week.completed,
			expected: week.expected,
			adherence: week.adherence,
			displayText: `${week.completed}/${week.expected}`,
		}));
	}, [weeklyData]);

	return (
		<div
			className="adherence-heatmap"
			role="region"
			aria-label={t('patient.adherence.heatmap.exerciseAdherenceCalendar')}>
			<Card loading={loading}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					{/* Calendar Heatmap */}
					<div>
						<Title level={5}>
							{t('patient.adherence.heatmap.dailyExerciseActivity')}
						</Title>
						<div
							className="heatmap-calendar"
							role="table"
							aria-label={t('patient.adherence.heatmap.dailyAdherenceHeatmap')}>
							{/* Day labels */}
							<div className="heatmap-day-labels" role="row">
								<div className="heatmap-spacer"></div>
								{[
									t('patient.adherence.heatmap.days.sun'),
									t('patient.adherence.heatmap.days.mon'),
									t('patient.adherence.heatmap.days.tue'),
									t('patient.adherence.heatmap.days.wed'),
									t('patient.adherence.heatmap.days.thu'),
									t('patient.adherence.heatmap.days.fri'),
									t('patient.adherence.heatmap.days.sat'),
								].map((day, index) => (
									<div
										key={`day-${index}`}
										className="heatmap-day-label"
										role="columnheader">
										{day}
									</div>
								))}
							</div>

							{/* Weeks grid */}
							{calendarGrid.map((week, weekIdx) => (
								<div key={weekIdx} className="heatmap-week-row" role="row">
									{/* Week label */}
									<div className="heatmap-week-label" role="rowheader">
										{format(week.weekStart, 'MMM dd')}
									</div>

									{/* Days in week */}
									{week.days.map((day, dayIdx) => {
										const adherenceLevel = day.data?.adherenceLevel || 0;
										const count = day.data?.count || 0;
										const dateStr = format(day.date, 'MMM dd, yyyy');

										const tooltipText =
											count > 0
												? count === 1
													? t('patient.adherence.heatmap.tooltips.withActivity', {
															date: dateStr,
															count,
															percentage: Math.round(adherenceLevel * 100),
														})
													: t(
															'patient.adherence.heatmap.tooltips.withActivities',
															{
																date: dateStr,
																count,
																percentage: Math.round(adherenceLevel * 100),
															},
														)
												: t('patient.adherence.heatmap.tooltips.noExercises', {
														date: dateStr,
													});

										const exerciseText =
											count > 0
												? count === 1
													? t('patient.adherence.heatmap.exerciseCount.one', {
															count,
														})
													: t('patient.adherence.heatmap.exerciseCount.other', {
															count,
														})
												: t('patient.adherence.heatmap.exerciseCount.zero');

										return (
											<Tooltip key={dayIdx} title={tooltipText}>
												<div
													className="heatmap-cell"
													role="cell"
													style={{
														backgroundColor: getAdherenceColor(adherenceLevel),
													}}
													aria-label={`${dateStr}, ${exerciseText}, ${getAdherenceColorName(adherenceLevel, t)}`}>
													<span className="sr-only">{exerciseText}</span>
												</div>
											</Tooltip>
										);
									})}
								</div>
							))}
						</div>

						{/* Legend */}
						{showLegend && (
							<div
								className="heatmap-legend"
								role="group"
								aria-label={t('patient.adherence.heatmap.adherenceLevelLegend')}>
								<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
									{t('patient.adherence.heatmap.less')}
								</Text>
								<div
									className="heatmap-legend-item"
									style={{ backgroundColor: 'var(--color-text-tertiary)' }}
									aria-label={t('patient.adherence.heatmap.noActivity')}
								/>
								<div
									className="heatmap-legend-item"
									style={{ backgroundColor: 'var(--color-error)' }}
									aria-label={t('patient.adherence.heatmap.lowAdherence')}
								/>
								<div
									className="heatmap-legend-item"
									style={{ backgroundColor: 'var(--color-warning)' }}
									aria-label={t('patient.adherence.heatmap.mediumAdherence')}
								/>
								<div
									className="heatmap-legend-item"
									style={{ backgroundColor: 'var(--color-success)' }}
									aria-label={t('patient.adherence.heatmap.highAdherence')}
								/>
								<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
									{t('patient.adherence.heatmap.more')}
								</Text>
							</div>
						)}
					</div>

					{/* Weekly adherence chart */}
					<div>
						<Title level={5}>
							{t('patient.adherence.heatmap.weeklyProgress')}
						</Title>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart
								data={weeklyChartData}
								margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="var(--color-border)"
								/>
								<XAxis
									dataKey="week"
									stroke="var(--color-text-secondary)"
									style={{ fontSize: 'var(--font-size-xs)' }}
								/>
								<YAxis
									stroke="var(--color-text-secondary)"
									style={{ fontSize: 'var(--font-size-xs)' }}
									label={{
										value: t('patient.adherence.heatmap.exercises'),
										angle: -90,
										position: 'insideLeft',
										style: { fill: 'var(--color-text-secondary)' },
									}}
								/>
								<RechartsTooltip
									content={({ active, payload }) => {
										if (active && payload && payload.length) {
											const data = payload[0].payload;
											return (
												<div
													className="custom-tooltip"
													style={{
														backgroundColor: 'var(--color-bg-container)',
														border: '1px solid var(--color-border)',
														padding: 'var(--spacing-2) var(--spacing-3)',
														borderRadius: 'var(--radius-sm)',
													}}>
													<Text strong>{data.week}</Text>
													<br />
													<Text>
														{t('patient.adherence.heatmap.completed')}: {data.completed}
													</Text>
													<br />
													<Text>
														{t('patient.adherence.heatmap.expected')}: {data.expected}
													</Text>
													<br />
													<Text>
														{t('patient.adherence.heatmap.adherence')}: {data.adherence}
														%
													</Text>
												</div>
											);
										}
										return null;
									}}
								/>
								<Legend />
								<Bar
									dataKey="completed"
									name={t('patient.adherence.heatmap.completed')}
									stackId="exercises"
									label={{ position: 'top', fill: 'var(--color-text)' }}>
									{weeklyChartData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={
												entry.adherence >= 80
													? 'var(--color-success)'
													: entry.adherence >= 50
														? 'var(--color-warning)'
														: 'var(--color-error)'
											}
										/>
									))}
								</Bar>
								<Bar
									dataKey="expected"
									name={t('patient.adherence.heatmap.expected')}
									stackId="exercises"
									fill="var(--color-text-tertiary)"
									opacity={0.3}
								/>
							</BarChart>
						</ResponsiveContainer>

						{/* Comparison summary */}
						{weeklyChartData.length > 0 && (
							<div
								className="adherence-summary"
								style={{ marginTop: 'var(--spacing-4)', textAlign: 'center' }}>
								<Text>
									<strong>
										{t('patient.adherence.heatmap.summary.thisWeek')}
									</strong>{' '}
									{t('patient.adherence.heatmap.summary.completedOfExpected', {
										completed:
											weeklyChartData[weeklyChartData.length - 1].completed,
										expected:
											weeklyChartData[weeklyChartData.length - 1].expected,
										adherence:
											weeklyChartData[weeklyChartData.length - 1].adherence,
									})}
								</Text>
							</div>
						)}
					</div>
				</Space>
			</Card>
		</div>
	);
};

AdherenceHeatmap.displayName = 'AdherenceHeatmap';
