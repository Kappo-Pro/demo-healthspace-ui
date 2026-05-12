import React from 'react';
import { render, screen } from '@testing-library/react';
import { OPostureJourneyView } from './OPostureJourneyView';

describe('OPostureJourneyView', () => {
	const mockJourney = {
		patientId: '1',
		startDate: '2025-01-01',
		sessions: [],
		milestones: [],
		progress: {
			totalAssessments: 5,
			averageScore: 80,
			scoreImprovement: 15,
			adherenceRate: 90,
		},
	};

	it('should render journey title', () => {
		render(<OPostureJourneyView journeyState={mockJourney} />);
		expect(screen.getByText('Patient Journey')).toBeInTheDocument();
	});
});
