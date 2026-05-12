/**
 * UserStatusBadge Component
 *
 * Displays user online/offline/away/busy status with a colored dot and optional text label.
 * Uses Ant Design's built-in badge status types for consistent styling.
 *
 * @example
 * ```tsx
 * // With text label
 * <UserStatusBadge status="online" />              // Shows: 🟢 Online
 * <UserStatusBadge status="away" text={t('common.userStatus.away')} />    // Shows: 🟡 Away
 *
 * // Just the dot
 * <UserStatusBadge status="busy" showText={false} />  // Shows: 🔴
 *
 * // Custom text
 * <UserStatusBadge status="online" text={t('common.userStatus.activeNow')} />  // Shows: 🟢 Active Now
 * ```
 */

import React from 'react';
import { Badge } from 'antd';
import type { BadgeStatus } from '@atoms/Badge/badgeConfig';

export interface UserStatusBadgeProps {
  /** User status */
  status: 'online' | 'offline' | 'away' | 'busy';

  /** Optional text label (defaults to capitalized status) */
  text?: string;

  /** Show text label or just the dot */
  showText?: boolean;

  /** Custom className for styling */
  className?: string;
}

/**
 * User Status Badge
 *
 * Displays user online/offline status with a colored dot and optional text.
 * Maps user status to Ant Design badge status colors:
 * - online → success (green)
 * - away → warning (yellow)
 * - busy → error (red)
 * - offline → default (gray)
 */
export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  text,
  showText = true,
  className,
}) => {
  // Map user status to Ant Design badge status
  const statusMap: Record<string, BadgeStatus> = {
    online: 'success',
    away: 'warning',
    busy: 'error',
    offline: 'default',
  };

  // Default text: capitalize first letter
  const displayText = text || (showText ? status.charAt(0).toUpperCase() + status.slice(1) : undefined);

  return (
    <Badge
      status={statusMap[status]}
      text={displayText}
      className={className}
    />
  );
};

export default UserStatusBadge;
