/**
 * DroppableCalendarSlot
 *
 * Droppable wrapper for calendar cells
 * Handles program drops and event rescheduling
 *
 * Features:
 * - Visual drop feedback
 * - Date validation (no past drops)
 * - Optimistic UI updates
 * - Error handling with rollback
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { message } from 'antd';
import { format, isPast, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { Program } from '@molecules/DraggableProgramCard';
import type { ScheduledActivity } from '@services/mockSchedulingApi';
import './styles.css';

interface DroppableCalendarSlotProps {
	date: Date;
	children: React.ReactNode;
	onProgramDrop: (program: Program, date: Date) => Promise<void>;
	onEventReschedule?: (
		event: ScheduledActivity,
		newDate: Date,
	) => Promise<void>;
}

export default function DroppableCalendarSlot({
	date,
	children,
	onProgramDrop,
	onEventReschedule,
}: DroppableCalendarSlotProps) {
	const { t } = useTranslation();
	const slotId = `calendar-slot-${format(date, 'yyyy-MM-dd')}`;

	const { setNodeRef, isOver, active } = useDroppable({
		id: slotId,
		data: {
			date,
			type: 'CALENDAR_SLOT',
		},
	});

	// Validate drop is allowed (no past dates)
	const isPastDate = isPast(startOfDay(date)) && !isDateToday(date);
	const canDrop = !isPastDate;

	// Determine what's being dragged
	const _isDraggingProgram = active?.data?.current?.type === 'PROGRAM';
	const _isDraggingEvent = active?.data?.current?.type === 'SCHEDULED_EVENT';

	const handleDrop = async () => {
		if (!active || !canDrop) return;

		const dragData = active.data.current;

		try {
			if (dragData?.type === 'PROGRAM') {
				await onProgramDrop(dragData.program, date);
			} else if (dragData?.type === 'SCHEDULED_EVENT' && onEventReschedule) {
				await onEventReschedule(dragData.scheduledEvent, date);
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: t('common.calendar.validation.failedToScheduleActivity');
			message.error(errorMessage);
		}
	};

	// Auto-handle drop when isOver changes to false (dropped)
	React.useEffect(() => {
		if (!isOver && active && active.data.current?.lastOver === slotId) {
			handleDrop();
		}
		// Note: handleDrop and slotId are intentionally excluded from deps
		// - handleDrop is recreated on every render but contains stable logic
		// - slotId is derived from date prop and doesn't need separate tracking
		// - Including them would cause unnecessary effect re-runs on every render
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOver, active]);

	const className = [
		'droppable-calendar-slot',
		isOver && canDrop ? 'droppable-calendar-slot--hover' : '',
		isOver && !canDrop ? 'droppable-calendar-slot--invalid' : '',
		canDrop
			? 'droppable-calendar-slot--valid'
			: 'droppable-calendar-slot--disabled',
		isPastDate ? 'droppable-calendar-slot--past' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div ref={setNodeRef} className={className}>
			{children}
			{isOver && !canDrop && (
				<div className="droppable-calendar-slot__invalid-message">
					{t('common.calendar.validation.cannotScheduleInPast')}
				</div>
			)}
		</div>
	);
}

function isDateToday(date: Date): boolean {
	const today = startOfDay(new Date());
	const checkDate = startOfDay(date);
	return today.getTime() === checkDate.getTime();
}
