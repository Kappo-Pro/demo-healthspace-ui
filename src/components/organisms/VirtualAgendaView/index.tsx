import { useMemo, useState, useCallback } from 'react';
import { List } from 'react-window';
import { Input, Empty, Typography, Space } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { format, isSameDay, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { CalendarEvent } from '@utils/activityStreamTransformers';
import { debounce } from '@utils/performance';
import './styles.css';

const { Text } = Typography;

export interface VirtualAgendaViewProps {
	/** Events to display in agenda */
	events: CalendarEvent[];
	/** Callback when event is selected */
	onSelectEvent?: (event: CalendarEvent) => void;
	/** Height of the agenda view */
	height?: number;
	/** Enable search filtering */
	enableSearch?: boolean;
	/** Loading state */
	loading?: boolean;
}

interface GroupedEvent {
	date: Date;
	events: CalendarEvent[];
}

/**
 * VirtualAgendaView - High-performance agenda view using virtual scrolling
 *
 * Features:
 * - Virtual scrolling for 1000+ events
 * - Debounced search filtering
 * - Grouped by date
 * - Optimized rendering
 * - Memory efficient
 *
 * @example
 * ```tsx
 * <VirtualAgendaView
 *   events={calendarEvents}
 *   onSelectEvent={handleSelect}
 *   height={600}
 *   enableSearch={true}
 * />
 * ```
 */
export default function VirtualAgendaView({
	events,
	onSelectEvent,
	height = 600,
	enableSearch = true,
	loading = false,
}: VirtualAgendaViewProps) {
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');

	// Debounced search to avoid re-rendering on every keystroke
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSearch = useCallback(
		debounce((query: string) => {
			setDebouncedQuery(query.toLowerCase());
		}, 300),

		[],
	);

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setSearchQuery(value);
			debouncedSearch(value);
		},
		[debouncedSearch],
	);

	// Filter and group events by date
	const groupedEvents = useMemo(() => {
		// Safety check - ensure events is an array
		if (!events || !Array.isArray(events)) {
			return [];
		}

		// Filter by search query
		let filteredEvents = events;
		if (debouncedQuery) {
			filteredEvents = events.filter(event => {
				const searchableText = [
					event.title,
					event.resource.userName,
					event.resource.message,
					event.resource.activityType,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();

				return searchableText.includes(debouncedQuery);
			});
		}

		// Sort by date
		const sortedEvents = [...filteredEvents].sort(
			(a, b) => a.start.getTime() - b.start.getTime(),
		);

		// Group by date
		const grouped: GroupedEvent[] = [];
		let currentDate: Date | null = null;
		let currentGroup: CalendarEvent[] = [];

		sortedEvents.forEach(event => {
			const eventDate = startOfDay(event.start);

			if (!currentDate || !isSameDay(eventDate, currentDate)) {
				if (currentGroup.length > 0) {
					grouped.push({
						date: currentDate ?? new Date(),
						events: currentGroup,
					});
				}
				currentDate = eventDate;
				currentGroup = [event];
			} else {
				currentGroup.push(event);
			}
		});

		// Add last group
		if (currentGroup.length > 0 && currentDate !== null) {
			grouped.push({ date: currentDate, events: currentGroup });
		}

		return grouped;
	}, [events, debouncedQuery]);

	// Flatten grouped events for virtual list
	const flattenedItems = useMemo(() => {
		const items: Array<
			{ type: 'header'; date: Date } | { type: 'event'; event: CalendarEvent }
		> = [];

		groupedEvents.forEach(group => {
			// Add date header
			items.push({ type: 'header', date: group.date });

			// Add events
			group.events.forEach(event => {
				items.push({ type: 'event', event });
			});
		});

		return items;
	}, [groupedEvents]);

	// Render individual row
	const Row = useCallback(
		({ index, style }: { index: number; style: React.CSSProperties }) => {
			const item = flattenedItems[index];

			if (item.type === 'header') {
				return (
					<div style={style} className="virtual-agenda__date-header">
						<Text strong>{format(item.date, 'EEEE, MMMM d, yyyy')}</Text>
					</div>
				);
			}

			const { event } = item;
			const { resource } = event || {};

			// Safety check - skip rendering if event or resource is invalid
			if (!event || !resource) {
				return <div style={style} className="virtual-agenda__event-row" />;
			}

			return (
				<div
					style={style}
					className="virtual-agenda__event-row"
					onClick={() => onSelectEvent?.(event)}
					role="button"
					tabIndex={0}
					onKeyDown={e => {
						if (e.key === 'Enter' || e.key === ' ') {
							onSelectEvent?.(event);
						}
					}}>
					<div className="virtual-agenda__event-time">
						<Text type="secondary">{format(event.start, 'h:mm a')}</Text>
					</div>
					<div className="virtual-agenda__event-content">
						<div className="virtual-agenda__event-title">
							<Text strong>{event.title || 'Untitled Event'}</Text>
						</div>
						<div className="virtual-agenda__event-meta">
							<Space size={8}>
								<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
									{resource.userName || 'Unknown'}
								</Text>
								<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
									•
								</Text>
								<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
									{resource.activityType || 'N/A'}
								</Text>
							</Space>
						</div>
						{resource.message && (
							<div className="virtual-agenda__event-message">
								<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
									{resource.message}
								</Text>
							</div>
						)}
					</div>
				</div>
			);
		},
		[flattenedItems, onSelectEvent],
	);

	if (loading) {
		return (
			<div className="virtual-agenda" style={{ height }}>
				<div className="virtual-agenda__loading">
					{t('common.calendar.agenda.loading')}
				</div>
			</div>
		);
	}

	return (
		<div className="virtual-agenda" style={{ height }}>
			{/* Search bar */}
			{enableSearch && (
				<div className="virtual-agenda__search">
					<Input
						placeholder={t('common.calendar.agenda.searchPlaceholder')}
						prefix={<UntitledIcon name="search" size={16} />}
						value={searchQuery}
						onChange={handleSearchChange}
						allowClear
					/>
				</div>
			)}

			{/* Results count */}
			{enableSearch && debouncedQuery && (
				<div className="virtual-agenda__results">
					<Text type="secondary">
						{t('common.calendar.agenda.foundEvents', {
							count: flattenedItems.filter(item => item.type === 'event')
								.length,
						})}
					</Text>
				</div>
			)}

			{/* Virtual list */}
			{flattenedItems.length === 0 ? (
				<Empty
					description={
						debouncedQuery
							? t('common.calendar.agenda.noEventsFound')
							: t('common.calendar.agenda.noEventsToDisplay')
					}
					style={{ marginTop: 48 }}
				/>
			) : (
				<List
					height={height - (enableSearch ? 100 : 20)}
					itemCount={flattenedItems.length}
					itemSize={70}
					width="100%"
					className="virtual-agenda__list">
					{Row}
				</List>
			)}
		</div>
	);
}
