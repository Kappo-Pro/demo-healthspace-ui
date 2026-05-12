import React, { Suspense, lazy, ComponentType } from 'react';
import { Spin } from 'antd';

/**
 * Lazy load wrapper with loading fallback
 *
 * Wraps React.lazy() with automatic Suspense boundary and loading state.
 * This utility enables code splitting at the route or component level,
 * reducing initial bundle size and improving load times.
 *
 * @param importFunc - Dynamic import function that returns a Promise with default export
 * @param fallback - Optional custom loading component (defaults to centered Spin)
 *
 * @example
 * // Route-level code splitting
 * const Dashboard = lazyLoad(() => import('./pages/Dashboard'));
 *
 * @example
 * // Component-level code splitting with custom fallback
 * const HeavyChart = lazyLoad(
 *   () => import('./components/HeavyChart'),
 *   <Skeleton.Image style={{ width: '100%', height: 400 }} />
 * );
 */
export function lazyLoad<T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense
      fallback={
        fallback || (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
            }}
            data-testid="lazy-loading-fallback"
          >
            <Spin size="large"  />
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Lazy load with skeleton fallback for better UX
 *
 * @param importFunc - Dynamic import function
 * @param skeleton - Skeleton component to show while loading
 *
 * @example
 * import { TableSkeleton } from '@atoms/Skeletons';
 * const PatientList = lazyLoadWithSkeleton(
 *   () => import('./pages/PatientList'),
 *   <TableSkeleton rows={10} />
 * );
 */
export function lazyLoadWithSkeleton<T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  skeleton: React.ReactNode
) {
  return lazyLoad(importFunc, skeleton);
}

export default lazyLoad;
