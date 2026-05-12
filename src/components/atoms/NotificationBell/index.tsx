/**
 * NotificationBell Component
 *
 * A notification bell icon with a badge showing unread notification count.
 * The badge automatically hides when count is 0 and shows "99+" for large counts.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <NotificationBell unreadCount={5} onClick={() => showNotifications()} />
 *
 * // No badge shown when count is 0
 * <NotificationBell unreadCount={0} onClick={() => showNotifications()} />
 *
 * // Shows "99+" for large counts
 * <NotificationBell unreadCount={150} onClick={() => showNotifications()} />
 * ```
 */

import React from 'react';
import { Badge } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { DEFAULT_OVERFLOW_COUNT } from '@atoms/Badge/badgeConfig';

export interface NotificationBellProps {
  /** Number of unread notifications */
  unreadCount: number;

  /** Click handler for the bell icon */
  onClick?: () => void;

  /** Icon size in pixels */
  size?: number;

  /** Custom className for styling */
  className?: string;

  /** Badge offset [x, y] */
  offset?: [number, number];
}

/**
 * Notification Bell with Badge
 *
 * Displays a bell icon with a badge showing unread notification count.
 * - Badge automatically hides when count is 0
 * - Shows "99+" for counts > 99 (configurable via overflowCount)
 * - Fully accessible with ARIA attributes
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  onClick,
  size = 20,
  className,
  offset = [-5, 5],
}) => {
  return (
    <Badge
      count={unreadCount}
      offset={offset}
      overflowCount={DEFAULT_OVERFLOW_COUNT}
      className={className}
    >
      <UntitledIcon
        name="bell"
        size={size}
        onClick={onClick}
        style={{
          color: 'var(--text-secondary)',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      />
    </Badge>
  );
};

export default NotificationBell;
