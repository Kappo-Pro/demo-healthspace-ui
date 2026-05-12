import React from 'react';
import { render, screen } from '@testing-library/react';
import { OPostureDetailView } from './OPostureDetailView';

describe('OPostureDetailView', () => {
	const mockSession = {
		id: '1',
		userId: '1',
		timestamp: '2025-01-15',
		duration: 300,
		poseData: [],
		analysis: {
			overallScore: 85,
			status: 'good' as const,
			metrics: {
				headAlignment: 90,
				shoulderSymmetry: 85,
				spineCurvature: 80,
				hipAlignment: 82,
				balance: 88,
			},
			issues: [],
			insights: [],
		},
		metadata: {
			deviceType: 'desktop' as const,
			cameraQuality: 'high' as const,
			lighting: 'good' as const,
		},
	};

	it('should render detail view title', () => {
		render(<OPostureDetailView session={mockSession} />);
		expect(screen.getByText('Posture Assessment Details')).toBeInTheDocument();
	});
});
