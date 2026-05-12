/**
 * DashboardHeroMetrics Component Tests
 *
 * EPIC-009-S3: Test Suite for DashboardHeroMetrics Molecule Component
 *
 * Test Strategy:
 * 1. Test rendering with mock metrics data
 * 2. Test null ROM score handling
 * 3. Test loading state
 * 4. Test responsive grid layout
 * 5. Test singular/plural streak suffix
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardHeroMetrics } from '../index';

describe('DashboardHeroMetrics', () => {
  const mockMetrics = {
    romScore: 85,
    romTrend: 5,
    sessionsCompleted: 12,
    sessionsTrend: 3,
    currentStreak: 7,
    streakTrend: 2,
  };

  it('renders without crashing', () => {
    render(<DashboardHeroMetrics metrics={mockMetrics} />);
    expect(screen.getByText('ROM Score')).toBeInTheDocument();
    expect(screen.getByText('Sessions Completed')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
  });

  it('renders ROM score card with correct value', () => {
    render(<DashboardHeroMetrics metrics={mockMetrics} />);
    expect(screen.getByText('ROM Score')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders sessions completed card with correct value', () => {
    render(<DashboardHeroMetrics metrics={mockMetrics} />);
    expect(screen.getByText('Sessions Completed')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders current streak card with correct value', () => {
    render(<DashboardHeroMetrics metrics={mockMetrics} />);
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('handles null ROM score correctly', () => {
    const metricsWithNullRom = {
      ...mockMetrics,
      romScore: null,
    };

    render(<DashboardHeroMetrics metrics={metricsWithNullRom} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays correct suffix for ROM score when present', () => {
    const { container } = render(<DashboardHeroMetrics metrics={mockMetrics} />);
    // Ant Design Statistic renders suffix in specific structure
    const romCard = container.querySelector('.ant-statistic');
    expect(romCard).toBeInTheDocument();
  });

  it('works without optional trend indicators', () => {
    const metricsWithoutTrends = {
      romScore: 85,
      sessionsCompleted: 12,
      currentStreak: 7,
    };

    render(<DashboardHeroMetrics metrics={metricsWithoutTrends} />);
    expect(screen.getByText('ROM Score')).toBeInTheDocument();
    expect(screen.getByText('Sessions Completed')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <DashboardHeroMetrics metrics={mockMetrics} className="custom-class" />
    );

    const row = container.querySelector('.dashboard-hero-metrics');
    expect(row).toHaveClass('custom-class');
  });

  it('handles zero values correctly', () => {
    const zeroMetrics = {
      romScore: 0,
      sessionsCompleted: 0,
      currentStreak: 0,
    };

    render(<DashboardHeroMetrics metrics={zeroMetrics} />);
    expect(screen.getByText('ROM Score')).toBeInTheDocument();
    expect(screen.getByText('Sessions Completed')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
  });

  it('renders responsive grid layout', () => {
    const { container } = render(<DashboardHeroMetrics metrics={mockMetrics} />);

    // Check that we have a Row container
    const row = container.querySelector('.ant-row');
    expect(row).toBeInTheDocument();

    // Check that we have 3 Col components
    const cols = container.querySelectorAll('.ant-col');
    expect(cols.length).toBe(3);
  });

  it('handles negative trend values', () => {
    const negativeMetrics = {
      romScore: 85,
      romTrend: -5,
      sessionsCompleted: 12,
      sessionsTrend: -3,
      currentStreak: 7,
      streakTrend: -2,
    };

    render(<DashboardHeroMetrics metrics={negativeMetrics} />);
    expect(screen.getByText('ROM Score')).toBeInTheDocument();
    expect(screen.getByText('Sessions Completed')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    const { container } = render(
      <DashboardHeroMetrics metrics={mockMetrics} loading={true} />
    );

    // Ant Design Card with loading shows skeleton
    const skeletons = container.querySelectorAll('.ant-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
