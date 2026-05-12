/**
 * DraggableScheduledEvent
 *
 * Wrapper to make scheduled events draggable for rescheduling
 *
 * Features:
 * - Drag-to-reschedule
 * - Visual drag feedback
 * - Touch support
 */

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ScheduledActivity } from '@services/mockSchedulingApi';
import './styles.css';

interface DraggableScheduledEventProps {
  scheduledEvent: ScheduledActivity;
  children: React.ReactNode;
}

export default function DraggableScheduledEvent({
  scheduledEvent,
  children,
}: DraggableScheduledEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-${scheduledEvent.id}`,
    data: {
      type: 'SCHEDULED_EVENT',
      scheduledEvent,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1000 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-scheduled-event ${isDragging ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
