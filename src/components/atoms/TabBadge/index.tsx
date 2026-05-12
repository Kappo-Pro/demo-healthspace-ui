/**
 * TabBadge Component
 *
 * Epic 2 - Story 2.6: Implement Tab Badges for Unsaved Changes
 *
 * Displays a colored dot badge on tab labels to indicate unsaved changes state:
 * - Orange: Unsaved changes exist
 * - Green: Recently saved (within 3 seconds)
 * - None: No badge (clean state)
 *
 * Features:
 * - Ant Design Badge component with dot indicator
 * - ARIA labels for screen reader accessibility
 * - Three state system: 'unsaved' | 'saved' | 'none'
 * - Clean, minimal visual design
 */

import React from 'react';
import { Badge } from 'antd';

/**
 * Badge status type
 */
export type TabBadgeStatus = 'unsaved' | 'saved' | 'none';

/**
 * TabBadge component props
 */
export interface TabBadgeProps {
  /** Current status of the tab (determines badge color and visibility) */
  status: TabBadgeStatus;
}

/**
 * TabBadge component for displaying unsaved changes indicator on tabs
 *
 * Usage:
 * ```tsx
 * <TabBadge status="unsaved" /> // Orange dot
 * <TabBadge status="saved" />   // Green dot (disappears after 3s)
 * <TabBadge status="none" />    // No badge
 * ```
 */
export const TabBadge: React.FC<TabBadgeProps> = ({ status }) => {
  // Don't render anything if status is 'none'
  if (status === 'none') return null;

  // Determine badge color based on status
  const color = status === 'unsaved' ? 'var(--color-warning-600)' : 'var(--color-success-600)';

  // Determine ARIA label for accessibility
  const ariaLabel = status === 'unsaved' ? 'Unsaved changes' : 'Recently saved';

  return (
    <span style={{ marginLeft: 8 }} aria-label={ariaLabel}>
      <Badge dot color={color} />
    </span>
  );
};

export default TabBadge;
