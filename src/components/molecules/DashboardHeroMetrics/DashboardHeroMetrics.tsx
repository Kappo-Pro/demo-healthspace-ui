/**
 * DashboardHeroMetrics Molecule Component
 *
 * Orchestrates three MetricCard components to display ROM score, sessions completed,
 * and current streak in a responsive grid layout.
 *
 * @component
 * @example
 * ```tsx
 * <DashboardHeroMetrics
 *   metrics={{
 *     romScore: 85,
 *     romTrend: 5,
 *     sessionsCompleted: 12,
 *     sessionsTrend: 3,
 *     currentStreak: 7,
 *     streakTrend: 2,
 *   }}
 *   loading={false}
 * />
 * ```
 */

import React from 'react';
import { Row, Col } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { MetricCard } from '@atoms/MetricCard';
import type { DashboardHeroMetricsProps } from './types';
import './DashboardHeroMetrics.css';

export const DashboardHeroMetrics: React.FC<DashboardHeroMetricsProps> = ({
  metrics,
  loading = false,
  className = '',
}) => {
  const { t } = useTypedTranslation();
  const { romScore, romTrend, sessionsCompleted, sessionsTrend, currentStreak, streakTrend } = metrics;

  return (
    <Row
      gutter={[16, 16]}
      className={`dashboard-hero-metrics ${className}`.trim()}
    >
      {/* ROM Score Card */}
      <Col xs={24} sm={8} md={8}>
        <MetricCard
          title={t('Patient.data.dashboardScreen.romScore')}
          value={romScore !== null ? romScore : 'N/A'}
          trend={romTrend}
          suffix={romScore !== null ? '/100' : undefined}
          icon={<UntitledIcon name="trophy" size={16} />}
          loading={loading}
        />
      </Col>

      {/* Sessions Completed Card */}
      <Col xs={24} sm={8} md={8}>
        <MetricCard
          title={t('Patient.data.dashboardScreen.sessionsCompleted')}
          value={sessionsCompleted}
          trend={sessionsTrend}
          icon={<UntitledIcon name="calendar" size={16} />}
          loading={loading}
        />
      </Col>

      {/* Current Streak Card */}
      <Col xs={24} sm={8} md={8}>
        <MetricCard
          title={t('Patient.data.dashboardScreen.currentStreak')}
          value={currentStreak}
          trend={streakTrend}
          suffix={currentStreak === 1 ? ' day' : ' days'}
          icon={<UntitledIcon name="fire" size={16} />}
          loading={loading}
        />
      </Col>
    </Row>
  );
};

export default DashboardHeroMetrics;
