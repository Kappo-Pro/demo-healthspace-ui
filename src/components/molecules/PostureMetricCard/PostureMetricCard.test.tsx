import React from 'react';
import { render, screen } from '@testing-library/react';
import { PostureMetricCard } from './PostureMetricCard';

describe('PostureMetricCard', () => {
	it('should render metric title', () => {
		render(<PostureMetricCard title="Shoulder Symmetry" value={85} />);
		expect(screen.getByText('Shoulder Symmetry')).toBeInTheDocument();
	});

	it('should render metric value', () => {
		render(<PostureMetricCard title="Shoulder Symmetry" value={85} />);
		expect(screen.getByText('85/100')).toBeInTheDocument();
	});
});
