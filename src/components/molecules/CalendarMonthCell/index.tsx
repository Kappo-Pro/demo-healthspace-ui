import { useMemo } from 'react';
import { Badge } from 'antd';
import { format } from 'date-fns';
import type { CalendarEvent } from '@utils/activityStreamTransformers';
import { useTranslation } from 'react-i18next';
import './styles.css';

export interface CalendarMonthCellProps {
	date: Date;
	events: CalendarEvent[];
	isToday: boolean;
	isSelected: boolean;
	isCurrentMonth: boolean;
	isWeekend?: boolean;
	onSelectDay: (date: Date) => void;
	onShowMore: (date: Date, events: CalendarEvent[]) => void;
}

/**
 * Get density level based on event count
 * Used for heat map visualization
 */
function getDensityLevel(
	count: number,
): 'none' | 'low' | 'medium' | 'high' | 'very-high' {
	if (count === 0) return 'none';
	if (count <= 2) return 'low';
	if (count <= 5) return 'medium';
	if (count <= 10) return 'high';
	return 'very-high';
}

/**
 * CalendarMonthCell - Individual day cell in month grid view
 *
 * Features:
 * - Shows up to 3 events with "+N more" badge
 * - Color-coded by event density (heat map)
 * - Today/selected/weekend styling
 * - Click to open day detail modal
 */
export default function CalendarMonthCell({
	date,
	events,
	isToday,
	isSelected,
	isCurrentMonth,
	isWeekend = false,
	onSelectDay,
	onShowMore,
}: CalendarMonthCellProps) {
	const { t } = useTranslation();

	const MAX_VISIBLE_EVENTS = 3;

	// Sort events by time and limit to visible count
	const visibleEvents = useMemo(() => {
		return [...events]
			.sort((a, b) => a.start.getTime() - b.start.getTime())
			.slice(0, MAX_VISIBLE_EVENTS);
	}, [events]);

	const hiddenCount = Math.max(0, events.length - MAX_VISIBLE_EVENTS);
	const densityLevel = getDensityLevel(events.length);

	const handleCellClick = () => {
		onSelectDay(date);
	};

	const handleShowMore = (e: React.MouseEvent) => {
		e.stopPropagation();
		onShowMore(date, events);
	};

	const handleEventClick = (e: React.MouseEvent, _event: CalendarEvent) => {
		e.stopPropagation();
		// Event click will be handled by parent
	};

	// Build CSS classes
	const cellClasses = [
		'month-cell',
		isToday && 'month-cell--today',
		isSelected && 'month-cell--selected',
		!isCurrentMonth && 'month-cell--outside-month',
		isWeekend && 'month-cell--weekend',
		`month-cell--density-${densityLevel}`,
	]
		.filter(Boolean)
		.join(' ');

	const dayNumber = date.getDate();
	const formattedDate = format(date, 'MMMM d, yyyy');

	return (
		<div
			className={cellClasses}
			onClick={handleCellClick}
			role="button"
			tabIndex={0}
			aria-label={`${formattedDate}${events.length > 0 ? `, ${events.length} ${t('calendar.activities')}` : ''}`}
			aria-pressed={isSelected}
			aria-current={isToday ? 'date' : undefined}
			onKeyDown={e => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleCellClick();
				}
			}}>
			{/* Header with day number and event count badge */}
			<div className="month-cell__header">
				<span className="month-cell__day-number">{dayNumber}</span>
				{events.length > 0 && (
					<Badge
						count={events.length}
						className="month-cell__event-count"
						style={{
							backgroundColor:
								densityLevel === 'very-high'
									? 'var(--color-error-500)'
									: densityLevel === 'high'
										? 'var(--color-warning-500)'
										: densityLevel === 'medium'
											? 'var(--color-info-500)'
											: 'var(--color-primary-500)',
						}}
					/>
				)}
			</div>

			{/* Event list */}
			<div className="month-cell__events">
				{visibleEvents.map(event => (
					<div
						key={event.id}
						className={`month-cell__event month-cell__event--${event.resource.activityType}`}
						onClick={e => handleEventClick(e, event)}
						role="button"
						tabIndex={0}
						title={`${event.title} - ${event.resource.userName} at ${format(event.start, 'h:mm a')}`}
						style={{
							backgroundColor:
								event.resource.activityType === 'program'
									? 'var(--color-primary-100)'
									: event.resource.activityType === 'rom'
										? 'var(--color-blue-100)'
										: event.resource.activityType === 'rehab'
											? 'var(--color-green-100)'
											: event.resource.activityType === 'posture'
												? 'var(--color-purple-100)'
												: event.resource.activityType === 'pain-assessment'
													? 'var(--color-red-100)'
													: event.resource.activityType === 'survey'
														? 'var(--color-yellow-100)'
														: event.resource.hasVideo
															? 'var(--color-pink-100)'
															: event.resource.hasImage
																? 'var(--color-indigo-100)'
																: 'var(--color-gray-100)',
							borderLeft: `3px solid ${
								event.resource.activityType === 'program'
									? 'var(--color-primary-500)'
									: event.resource.activityType === 'rom'
										? 'var(--color-blue-500)'
										: event.resource.activityType === 'rehab'
											? 'var(--color-green-500)'
											: event.resource.activityType === 'posture'
												? 'var(--color-purple-500)'
												: event.resource.activityType === 'pain-assessment'
													? 'var(--color-red-500)'
													: event.resource.activityType === 'survey'
														? 'var(--color-yellow-500)'
														: event.resource.hasVideo
															? 'var(--color-pink-500)'
															: event.resource.hasImage
																? 'var(--color-indigo-500)'
																: 'var(--color-gray-500)'
							}`,
						}}
						onKeyDown={e => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleEventClick(e, event);
							}
						}}>
						<span className="month-cell__event-title">{event.title}</span>
						{event.start && (
							<span className="month-cell__event-time">
								{format(event.start, 'h:mm a')}
							</span>
						)}
					</div>
				))}

				{/* Show more button */}
				{hiddenCount > 0 && (
					<button
						className="month-cell__show-more"
						onClick={handleShowMore}
						aria-label={`Show ${hiddenCount} more ${t('calendar.activities')}`}
						type="button">
						+{hiddenCount} {t('calendar.more') || 'more'}
					</button>
				)}
			</div>
		</div>
	);
}
