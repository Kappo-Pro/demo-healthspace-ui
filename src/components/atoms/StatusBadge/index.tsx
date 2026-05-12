/**
 * StatusBadge
 *
 * Visual indicator for activity status
 *
 * Features:
 * - Color-coded by status
 * - Icon indicators
 * - Accessible labels
 * - Compact design
 */

import React from 'react';
import { Tag } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { ScheduledActivityStatus } from '@services/mockSchedulingApi';
import './styles.css';

export interface StatusBadgeProps {
  status: ScheduledActivityStatus;
  size?: 'small' | 'default';
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<
  ScheduledActivityStatus,
  {
    icon: React.ReactNode;
    color: string;
    label: string;
  }
> = {
  [ScheduledActivityStatus.PENDING]: {
    icon: <UntitledIcon name="clock" size={14} />,
    color: 'default',
    label: 'Pending',
  },
  [ScheduledActivityStatus.DUE]: {
    icon: <UntitledIcon name="clock" size={14} />,
    color: "var(--color-primary)",
    label: 'Due',
  },
  [ScheduledActivityStatus.OVERDUE]: {
    icon: <UntitledIcon name="warning" size={14} />,
    color: 'error',
    label: 'Overdue',
  },
  [ScheduledActivityStatus.COMPLETED]: {
    icon: <UntitledIcon name="checkCircle" size={14} />,
    color: 'success',
    label: 'Completed',
  },
  [ScheduledActivityStatus.CANCELLED]: {
    icon: <UntitledIcon name="closeCircle" size={14} />,
    color: 'default',
    label: 'Cancelled',
  },
  [ScheduledActivityStatus.SKIPPED]: {
    icon: <UntitledIcon name="closeCircle" size={14} />,
    color: 'warning',
    label: 'Skipped',
  },
};

export default function StatusBadge({
  status,
  size = 'default',
  showLabel = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  return (
    <Tag
      icon={config.icon}
      color={config.color}
      className={`status-badge status-badge--${size}`}
    >
      {showLabel && config.label}
    </Tag>
  );
}
