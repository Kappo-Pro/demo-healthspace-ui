/**
 * ProgramContextContent Component
 *
 * Displays grouped program routes when in programContext mode.
 * Shows categorized navigation with keyboard shortcuts.
 */

import React from 'react';
import { Typography, Empty } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { Program } from '../types';
import {
  PROGRAM_ROUTES,
  CATEGORY_LABELS,
  ProgramRouteCategory,
  getGroupedRoutes,
  interpolateRoute
} from '../programRoutes';
import { fuzzyMatch } from '@hooks/useFuzzySearch';
import styles from '../styles.module.css';

interface ProgramContextContentProps {
  program: Program;
  userId: string;
  query: string;
  selectedIndex: number;
  onNavigate: (route: string) => void;
  onItemHover: (index: number) => void;
}

export const ProgramContextContent = React.memo<ProgramContextContentProps>(({
  program,
  userId,
  query,
  selectedIndex,
  onNavigate,
  onItemHover
}) => {
  // Filter routes by query
  const filteredRoutes = query
    ? PROGRAM_ROUTES.filter(route =>
        fuzzyMatch(query, route.label, route.keywords) > 0
      )
    : PROGRAM_ROUTES;

  // Group filtered routes
  const groupedRoutes = getGroupedRoutes(filteredRoutes);

  // Calculate global index for each item
  let globalIndex = 0;
  const categoryOrder: ProgramRouteCategory[] = [
    'dashboard',
    'assessments',
    'programs',
    'settings',
    'other'
  ];

  if (filteredRoutes.length === 0) {
    return (
      <div className={styles.noResults}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`No routes found for "${query}"`}
        />
      </div>
    );
  }

  return (
    <div className={styles.programContextContent}>
      {/* Program Header */}
      <div className={styles.programHeader}>
        <Typography.Text strong style={{ fontSize: 14 }}>
          {program.name}
        </Typography.Text>
        {program.description && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {program.description}
          </Typography.Text>
        )}
      </div>

      {/* Grouped Routes */}
      <div className={styles.commandsList}>
        {categoryOrder.map(category => {
          const routes = groupedRoutes[category];
          if (!routes || routes.length === 0) return null;

          const categoryInfo = CATEGORY_LABELS[category];

          return (
            <div key={category} className={styles.commandGroup}>
              {/* Category Header */}
              <div className={styles.categoryHeader}>
                {categoryInfo.icon}
                <span>{categoryInfo.label}</span>
              </div>

              {/* Routes in Category */}
              {routes.map((route) => {
                const isSelected = globalIndex === selectedIndex;
                const fullRoute = interpolateRoute(route.route, userId);
                const currentGlobalIndex = globalIndex++;

                return (
                  <div
                    key={route.id}
                    className={`${styles.commandItem} ${isSelected ? styles.selected : ''}`}
                    onClick={() => onNavigate(fullRoute)}
                    onMouseEnter={() => onItemHover(currentGlobalIndex)}
                  >
                    <span className={styles.commandIcon}>{route.icon}</span>
                    <div className={styles.commandContent}>
                      <div className={styles.commandLabel}>{route.label}</div>
                      <div className={styles.commandDescription}>{route.description}</div>
                    </div>
                    {route.shortcut && (
                      <kbd className={styles.kbd}>{route.shortcut}</kbd>
                    )}
                    {isSelected && (
                      <kbd className={styles.kbd}>
                        <UntitledIcon name="cornerDownLeft" size={16} />
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
});
