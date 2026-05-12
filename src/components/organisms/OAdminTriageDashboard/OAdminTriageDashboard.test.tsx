import React from 'react';
import { render, screen } from '@testing-library/react';
import { OAdminTriageDashboard } from './OAdminTriageDashboard';

describe('OAdminTriageDashboard', () => {
	it('should render empty state when no patients', () => {
		render(<OAdminTriageDashboard patients={[]} />);
		expect(screen.getByText('No patients require review')).toBeInTheDocument();
	});
});
