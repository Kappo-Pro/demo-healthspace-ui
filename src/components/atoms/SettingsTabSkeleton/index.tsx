/**
 * SettingsTabSkeleton Component
 *
 * Epic 4 - Story 4.3: Optimize Performance (Code Splitting, Lazy Loading)
 *
 * Loading skeleton displayed while Settings tabs are lazy loading.
 * Matches the typical layout of Settings tab content to reduce layout shift.
 *
 * Used as Suspense fallback for lazy-loaded tab components.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<SettingsTabSkeleton />}>
 *   <LazyTabComponent />
 * </Suspense>
 * ```
 */

import React from 'react';
import { Skeleton } from 'antd';

/**
 * SettingsTabSkeleton - Loading state for Settings tabs
 *
 * Displays animated skeleton placeholders while tab components load.
 * Layout matches typical Settings tab structure:
 * - Header area (2 rows)
 * - Form input area (full width)
 * - Content area (3 rows)
 */
export const SettingsTabSkeleton: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      {/* Header Section */}
      <Skeleton active paragraph={{ rows: 2 }} />

      {/* Input/Form Section */}
      <Skeleton.Input
        active
        style={{ width: '100%', marginTop: 24, height: 40 }}
        block
      />

      {/* Content Section */}
      <Skeleton
        active
        paragraph={{ rows: 3 }}
        style={{ marginTop: 24 }}
      />

      {/* Additional Content Section */}
      <Skeleton.Input
        active
        style={{ width: '100%', marginTop: 24, height: 40 }}
        block
      />

      <Skeleton
        active
        paragraph={{ rows: 2 }}
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default SettingsTabSkeleton;
