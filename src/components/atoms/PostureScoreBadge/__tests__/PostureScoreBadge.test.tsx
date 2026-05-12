import React from 'react';
import { render, screen } from '@testing-library/react';
import PostureScoreBadge from '../index';

describe('PostureScoreBadge', () => {
  it('renders score value correctly', () => {
    render(<PostureScoreBadge score={78} />);
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('applies success gradient for scores 76-100', () => {
    const { container } = render(<PostureScoreBadge score={85} />);
    const badge = container.querySelector('.posture-score-badge');
    expect(badge).toHaveClass('posture-score-badge--success');
  });

  it('applies warning gradient for scores 51-75', () => {
    const { container } = render(<PostureScoreBadge score={65} />);
    const badge = container.querySelector('.posture-score-badge');
    expect(badge).toHaveClass('posture-score-badge--warning');
  });

  it('applies error gradient for scores 0-50', () => {
    const { container } = render(<PostureScoreBadge score={45} />);
    const badge = container.querySelector('.posture-score-badge');
    expect(badge).toHaveClass('posture-score-badge--error');
  });

  it('renders accessible label', () => {
    render(<PostureScoreBadge score={78} />);
    const badge = screen.getByRole('img');
    expect(badge).toHaveAttribute('aria-label', 'Posture score: 78 out of 100');
  });

  it('shows label when showLabel is true', () => {
    render(<PostureScoreBadge score={78} showLabel />);
    expect(screen.getByText('Posture Score')).toBeInTheDocument();
  });
});
