/**
 * MetricCard Component Tests
 *
 * Unit tests for MetricCard atom component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders with required props', () => {
    render(<MetricCard title="ROM Score" value={85} />);

    expect(screen.getByText('ROM Score')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(<MetricCard title="Status" value="Active" />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<MetricCard title="ROM Score" value={85} suffix="%" />);

    expect(screen.getByText('ROM Score')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    // Suffix is rendered by Ant Design Statistic
  });

  it('renders with custom icon', () => {
    render(
      <MetricCard
        title="Achievements"
        value={10}
        icon={<TrophyOutlined data-testid="trophy-icon" />}
      />
    );

    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
  });

  it('renders TrendIndicator when trend prop is provided', () => {
    const { container } = render(
      <MetricCard title="ROM Score" value={85} trend={12} />
    );

    // TrendIndicator should be in the document
    const trendIndicators = container.querySelectorAll('.trend-indicator');
    expect(trendIndicators.length).toBeGreaterThan(0);
  });

  it('does not render TrendIndicator when trend is undefined', () => {
    const { container } = render(
      <MetricCard title="ROM Score" value={85} />
    );

    // TrendIndicator should not be in the document
    const trendIndicators = container.querySelectorAll('.trend-indicator');
    expect(trendIndicators.length).toBe(0);
  });

  it('renders with loading state', () => {
    const { container } = render(
      <MetricCard title="ROM Score" value={85} loading={true} />
    );

    // Ant Design Card loading state adds skeleton
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetricCard title="ROM Score" value={85} className="custom-class" />
    );

    expect(container.querySelector('.metric-card.custom-class')).toBeInTheDocument();
  });

  it('renders with all props combined', () => {
    const { container } = render(
      <MetricCard
        title="Current Streak"
        value={15}
        suffix="days"
        trend={25}
        icon={<FireOutlined data-testid="fire-icon" />}
        className="streak-card"
      />
    );

    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByTestId('fire-icon')).toBeInTheDocument();
    expect(container.querySelector('.metric-card.streak-card')).toBeInTheDocument();
    expect(container.querySelectorAll('.trend-indicator').length).toBeGreaterThan(0);
  });

  it('renders with zero value', () => {
    render(<MetricCard title="Sessions" value={0} />);

    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders with negative trend', () => {
    const { container } = render(
      <MetricCard title="ROM Score" value={75} trend={-5} />
    );

    expect(screen.getByText('ROM Score')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(container.querySelectorAll('.trend-indicator').length).toBeGreaterThan(0);
  });
});
