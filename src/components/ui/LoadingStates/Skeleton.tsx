/**
 * Skeleton Component
 *
 * Loading placeholder component with shimmer animation.
 * Used for skeleton screens while content is loading.
 *
 * Based on UX Spec Phase 3: Visual Polish
 */

import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  /** Variant of skeleton */
  variant?: 'text' | 'title' | 'avatar' | 'button' | 'card' | 'rectangle';

  /** Width of skeleton (CSS value) */
  width?: string | number;

  /** Height of skeleton (CSS value) */
  height?: string | number;

  /** Additional CSS class */
  className?: string;

  /** Border radius (CSS value) */
  borderRadius?: string | number;

  /** Number of rows (for text variant) */
  rows?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className,
  borderRadius,
  rows = 1,
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  };

  // For text variant with multiple rows
  if (variant === 'text' && rows > 1) {
    return (
      <div className={className}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={`${styles.skeleton} ${styles.text}`}
            style={{
              ...style,
              width: index === rows - 1 && !width ? '80%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className || ''}`}
      style={style}
    />
  );
};

/** Skeleton for navigation items */
export const NavigationSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className={styles.navigationSkeleton}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={styles.navigationItem}
        style={{ animationDelay: `${i * 100}ms` }}
      />
    ))}
  </div>
);

/** Skeleton for card grid */
export const CardGridSkeleton: React.FC<{ columns?: number; rows?: number }> = ({
  columns = 3,
  rows = 2,
}) => (
  <div className={styles.cardGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {Array.from({ length: columns * rows }).map((_, i) => (
      <div key={i} className={styles.cardSkeleton}>
        <div className={styles.cardImage} />
        <div className={styles.cardContent}>
          <Skeleton variant="title" />
          <Skeleton variant="text" rows={2} />
        </div>
      </div>
    ))}
  </div>
);

/** Skeleton for table */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className={styles.tableSkeleton}>
    {/* Header */}
    <div className={styles.tableHeader}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width="80%" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className={styles.tableRow}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" />
        ))}
      </div>
    ))}
  </div>
);

/** Skeleton for form */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className={styles.formSkeleton}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className={styles.formField}>
        <Skeleton variant="text" width="30%" height="14px" />
        <Skeleton variant="rectangle" height="40px" />
      </div>
    ))}
    <Skeleton variant="button" width="120px" />
  </div>
);
