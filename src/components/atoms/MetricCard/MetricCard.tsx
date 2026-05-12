/**
 * MetricCard Atom Component
 *
 * A reusable metric display card using Ant Design's Statistic component
 * with optional trend indicators and icons for dashboard metrics.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   title="ROM Score"
 *   value={85}
 *   suffix="%"
 *   trend={12}
 *   icon={<TrophyOutlined />}
 * />
 * ```
 */

import React from 'react';
import { Card, Statistic } from 'antd';
import { TrendIndicator } from '@atoms/TrendIndicator';
import { MetricCardProps } from './types';
import './MetricCard.css';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  suffix,
  icon,
  loading = false,
  className = '',
}) => {
  return (
    <Card className={`metric-card ${className}`.trim()} loading={loading}>
      <div className="metric-card-header">
        {icon && <div className="metric-card-icon">{icon}</div>}
        <div className="metric-card-title">{title}</div>
      </div>

      <Statistic
        value={value}
        suffix={suffix}
        className="metric-card-value"
      />

      {trend !== undefined && <TrendIndicator value={trend} />}
    </Card>
  );
};

export default MetricCard;
