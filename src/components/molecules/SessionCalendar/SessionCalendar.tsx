/**
 * SessionCalendar - Molecule Component
 *
 * Displays a calendar heatmap visualization of user session history. Shows session
 * frequency with color intensity gradient, hover tooltips showing date and count.
 * Features responsive design, loading states, and design system theming.
 *
 * EPIC-022-S1: Session Calendar Molecule Component with Heatmap
 */

import React from 'react';
import { Tooltip, Spin, Empty } from 'antd';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { SessionCalendarProps } from './types';
import './SessionCalendar.css';

/**
 * Get color intensity based on session count
 * Uses design system tokens with opacity variants
 *
 * @param count - Number of sessions (0-5+)
 * @returns CSS color value
 */
const getColorIntensity = (count: number): string => {
	if (count === 0) return 'var(--color-gray-100)';
	if (count === 1) return 'var(--color-purple-200)';
	if (count === 2) return 'var(--color-purple-400)';
	if (count === 3) return 'var(--color-purple-600)';
	if (count === 4) return 'var(--brand-primary)';
	return 'var(--brand-primary-hover)'; // 5+
};

/**
 * SessionCalendar Component
 *
 * Renders a heatmap-style calendar grid showing session history for the last 90 days.
 * Similar to GitHub contribution graph, with color intensity representing session frequency.
 *
 * @component
 * @example
 * ```tsx
 * <SessionCalendar
 *   data={[
 *     { date: '2025-10-01', count: 2 },
 *     { date: '2025-10-15', count: 4 },
 *     { date: '2025-10-21', count: 3 }
 *   ]}
 * />
 * ```
 */
export const SessionCalendar: React.FC<SessionCalendarProps> = ({
	data,
	loading = false,
	className,
}) => {
	const { t } = useTranslation();

	/**
	 * Loading State
	 */
	if (loading) {
		return (
			<div className={`session-calendar-loading ${className || ''}`}>
				<Spin size="large">
					<div className="loading-content">
						{t('calendar.sessionCalendar.loading')}
					</div>
				</Spin>
			</div>
		);
	}

	/**
	 * Empty State
	 */
	if (!data || data.length === 0) {
		return (
			<div className={`session-calendar-empty ${className || ''}`}>
				<Empty
					description={t('calendar.sessionCalendar.noData')}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			</div>
		);
	}

	// Calendar configuration
	const cellSize = 12;
	const cellGap = 2;

	// Generate last 90 days
	const endDate = new Date();
	const startDate = subDays(endDate, 89);
	const days = eachDayOfInterval({ start: startDate, end: endDate });

	// Create lookup map for session counts
	const sessionMap = new Map(data.map((d) => [d.date, d.count]));

	// Organize days into weeks (7 days per week)
	const weeks: Date[][] = [];
	let currentWeek: Date[] = [];

	days.forEach((day, idx) => {
		currentWeek.push(day);
		if (currentWeek.length === 7 || idx === days.length - 1) {
			weeks.push(currentWeek);
			currentWeek = [];
		}
	});

	return (
		<div className={`session-calendar ${className || ''}`}>
			<svg
				width={weeks.length * (cellSize + cellGap)}
				height={7 * (cellSize + cellGap)}
				className="session-calendar-svg"
				role="img"
				aria-label={t('calendar.sessionCalendar.ariaLabel')}
			>
				{weeks.map((week, weekIdx) =>
					week.map((day, dayIdx) => {
						const dateStr = format(day, 'yyyy-MM-dd');
						const count = sessionMap.get(dateStr) || 0;
						const color = getColorIntensity(count);

						const sessionText =
							count !== 1
								? t('calendar.sessionCalendar.tooltip.sessions')
								: t('calendar.sessionCalendar.tooltip.session');

						return (
							<Tooltip
								key={`${weekIdx}-${dayIdx}`}
								title={`${format(day, 'MMM d, yyyy')}: ${count} ${sessionText}`}
								mouseEnterDelay={0.2}
							>
								<rect
									x={weekIdx * (cellSize + cellGap)}
									y={dayIdx * (cellSize + cellGap)}
									width={cellSize}
									height={cellSize}
									fill={color}
									rx={2}
									className="session-calendar-cell"
									data-testid={`calendar-cell-${dateStr}`}
									data-count={count}
								/>
							</Tooltip>
						);
					})
				)}
			</svg>

			{/* Legend */}
			<div className="session-calendar-legend">
				<span className="legend-label">{t('calendar.sessionCalendar.legend.less')}</span>
				{[0, 1, 2, 3, 4, 5].map((count) => {
					const sessionText =
						count !== 1
							? t('calendar.sessionCalendar.tooltip.sessions')
							: t('calendar.sessionCalendar.tooltip.session');
					return (
						<div
							key={count}
							className="legend-cell"
							style={{ backgroundColor: getColorIntensity(count) }}
							title={`${count}${count === 5 ? '+' : ''} ${sessionText}`}
						/>
					);
				})}
				<span className="legend-label">{t('calendar.sessionCalendar.legend.more')}</span>
			</div>
		</div>
	);
};

SessionCalendar.displayName = 'SessionCalendar';
