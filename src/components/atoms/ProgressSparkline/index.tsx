import React from 'react';
import { Line } from '@ant-design/charts';
import './ProgressSparkline.css';

export interface ProgressSparklineProps {
  data: number[]; // array of scores
  showLabel?: boolean;
  compact?: boolean;
}

const ProgressSparkline: React.FC<ProgressSparklineProps> = ({
  data,
  showLabel = true,
  compact = false,
}) => {
  // Determine trend (improving or declining)
  const isImproving = data[data.length - 1] > data[0];
  const trendColor = isImproving ? 'var(--color-success)' : 'var(--color-error)';
  const improvement = data[data.length - 1] - data[0];
  const improvementPercent = Math.round((improvement / data[0]) * 100);

  // Format data for chart
  const chartData = data.map((score, index) => ({
    day: index + 1,
    score,
  }));

  const config = {
    data: chartData,
    xField: 'day',
    yField: 'score',
    smooth: true,
    color: trendColor,
    point: {
      size: 2,
      shape: 'circle',
    },
    tooltip: {
      showTitle: false,
      formatter: (datum: unknown) => ({
        name: 'Score',
        value: datum.score,
      }),
    },
    lineStyle: {
      lineWidth: 2,
    },
    areaStyle: {
      fill: `l(270) 0:${trendColor}00 1:${trendColor}33`,
    },
  };

  return (
    <div className={`progress-sparkline ${compact ? 'progress-sparkline--compact' : ''}`}>
      {showLabel && (
        <div className="progress-sparkline__label">
          Progress Trend:{' '}
          <span
            className="progress-sparkline__improvement"
            style={{ color: trendColor }}
          >
            {improvement > 0 ? '+' : ''}
            {improvement} pts ({improvementPercent}%)
          </span>
        </div>
      )}
      <div className="progress-sparkline__chart">
        <Line {...config} height={40} />
      </div>
    </div>
  );
};

export default ProgressSparkline;
