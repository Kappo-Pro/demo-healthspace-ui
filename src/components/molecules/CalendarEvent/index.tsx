/**
 * CalendarEvent
 *
 * Styled calendar event card with status indicators
 *
 * Features:
 * - Status-based styling (scheduled, completed, overdue)
 * - Status badge with icon
 * - Opacity and color variations
 * - Hover effects
 * - Click handling
 */

import React from 'react';
import { Card, Space, Typography } from 'antd';
import { format, isPast, isToday } from 'date-fns';
import StatusBadge from '@atoms/StatusBadge';
import { ScheduledActivityStatus, type ScheduledActivity } from '@services/mockSchedulingApi';
import './styles.css';

const { Text } = Typography;

export interface CalendarEventProps {
  activity: ScheduledActivity;
  onClick?: (activity: ScheduledActivity) => void;
  compact?: boolean;
}

/**
 * Determine display status based on activity state and date
 */
function getDisplayStatus(activity: ScheduledActivity): ScheduledActivityStatus {
  // If already has a status, use it
  if (activity.status === ScheduledActivityStatus.COMPLETED) {
    return ScheduledActivityStatus.COMPLETED;
  }

  if (activity.status === ScheduledActivityStatus.CANCELLED) {
    return ScheduledActivityStatus.CANCELLED;
  }

  if (activity.status === ScheduledActivityStatus.SKIPPED) {
    return ScheduledActivityStatus.SKIPPED;
  }

  // Calculate status based on scheduled date
  const scheduledDate = new Date(activity.scheduledFor);

  if (isToday(scheduledDate)) {
    return ScheduledActivityStatus.DUE;
  }

  if (isPast(scheduledDate)) {
    return ScheduledActivityStatus.OVERDUE;
  }

  return ScheduledActivityStatus.PENDING;
}

export default function CalendarEvent({
  activity,
  onClick,
  compact = false,
}: CalendarEventProps) {
  const displayStatus = getDisplayStatus(activity);

  const handleClick = () => {
    if (onClick) {
      onClick(activity);
    }
  };

  const className = [
    'calendar-event',
    `calendar-event--${displayStatus.toLowerCase()}`,
    compact ? 'calendar-event--compact' : '',
    onClick ? 'calendar-event--clickable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      size={compact ? 'small' : 'default'}
      className={className}
      onClick={handleClick}
      hoverable={!!onClick}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Header with title and status */}
        <div className="calendar-event__header">
          <Text
            strong
            className={`calendar-event__title ${
              displayStatus === ScheduledActivityStatus.COMPLETED
                ? 'calendar-event__title--completed'
                : ''
            }`}
          >
            {activity.title}
          </Text>
          <StatusBadge
            status={displayStatus}
            size={compact ? 'small' : 'default'}
            showLabel={!compact}
          />
        </div>

        {/* Time */}
        {activity.scheduledTime && (
          <Text type="secondary" className="calendar-event__time">
            {activity.scheduledTime}
          </Text>
        )}

        {/* Description (non-compact only) */}
        {!compact && activity.description && (
          <Text type="secondary" className="calendar-event__description">
            {activity.description}
          </Text>
        )}

        {/* Completed timestamp */}
        {displayStatus === ScheduledActivityStatus.COMPLETED && activity.completedAt && (
          <Text type="secondary" className="calendar-event__completed-time">
            Completed {format(new Date(activity.completedAt), 'MMM d, h:mm a')}
          </Text>
        )}
      </Space>
    </Card>
  );
}
