/**
 * PainAssessmentTab Unit Tests
 *
 * Tests for pain assessment tab component with comprehensive coverage.
 * Target coverage: ≥95%
 *
 * @version 2.2.0
 * @story Story 2.2 - Create PainAssessmentTab Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PainAssessmentTab, TPainData } from './PainAssessmentTab';

// Mock data for testing
const mockCompleteData: TPainData = {
	locations: [
		{ name: 'Lower Back', isPrimary: true },
		{ name: 'Left Hip', isPrimary: false },
		{ name: 'Right Knee', isPrimary: false },
	],
	intensity: 6,
	characteristics: ['Sharp', 'Aching', 'Stabbing'],
	temporalPatterns: {
		frequency: 'Intermittent',
		duration: 'Present for 6 months',
		timeOfDay: 'Morning stiffness, evening pain',
		aggravatingFactors: 'Sitting >30 minutes, bending forward',
		relievingFactors: 'Heat, gentle movement, rest',
	},
	functionalImpact: {
		mobility: {
			description: 'Difficulty walking >15 minutes',
			severity: 'medium',
		},
		sleep: {
			description: 'Wakes 2-3 times per night',
			severity: 'high',
		},
		activities: {
			description: 'Unable to sit at desk >1 hour',
			severity: 'medium',
		},
		selfCare: {
			description: 'Difficulty with sock and shoe application',
			severity: 'low',
		},
	},
};

const mockMinimalData: TPainData = {
	locations: ['Lower Back'],
	intensity: 4,
};

const mockHighSeverityData: TPainData = {
	locations: [{ name: 'Lower Back', isPrimary: true }],
	intensity: 9,
	characteristics: ['Severe', 'Constant'],
};

const mockLowSeverityData: TPainData = {
	locations: ['Neck'],
	intensity: 2,
};

const mockEmptyData: TPainData = {};

describe('PainAssessmentTab', () => {
	describe('Rendering with complete data', () => {
		it('renders all pain sections with complete data', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			expect(screen.getByText('Pain Locations')).toBeInTheDocument();
			expect(screen.getByText('Pain Intensity')).toBeInTheDocument();
			expect(screen.getByText('Pain Characteristics')).toBeInTheDocument();
			expect(screen.getByText('Temporal Patterns')).toBeInTheDocument();
			expect(screen.getByText('Impact on Function')).toBeInTheDocument();
		});

		it('displays section titles correctly', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			const sectionTitles = [
				'Pain Locations',
				'Pain Intensity',
				'Pain Characteristics',
				'Temporal Patterns',
				'Impact on Function',
			];

			sectionTitles.forEach((title) => {
				expect(screen.getByText(title)).toBeInTheDocument();
			});
		});
	});

	describe('Pain Locations Display (AC-2.2.2)', () => {
		it('displays pain locations correctly', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			expect(screen.getByText(/Lower Back.*Primary/i)).toBeInTheDocument();
			expect(screen.getByText('Left Hip')).toBeInTheDocument();
			expect(screen.getByText('Right Knee')).toBeInTheDocument();
		});

		it('handles string array locations', () => {
			const stringLocations: TPainData = {
				locations: ['Lower Back', 'Left Shoulder'],
			};
			render(<PainAssessmentTab data={stringLocations} />);

			expect(screen.getByText('Lower Back')).toBeInTheDocument();
			expect(screen.getByText('Left Shoulder')).toBeInTheDocument();
		});

		it('highlights primary location', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			const primaryTag = screen.getByText(/Lower Back.*Primary/i);
			expect(primaryTag).toBeInTheDocument();
		});

		it('shows empty state when no locations', () => {
			const noLocations: TPainData = { intensity: 5 };
			render(<PainAssessmentTab data={noLocations} />);

			expect(screen.getByText(/No pain locations reported/i)).toBeInTheDocument();
		});
	});

	describe('Pain Intensity Display (AC-2.2.3)', () => {
		it('shows pain intensity with correct severity indicator', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			expect(screen.getByText('6/10')).toBeInTheDocument();
			expect(screen.getByText('Moderate Pain')).toBeInTheDocument();
		});

		it('shows high severity for pain intensity 9/10', () => {
			render(<PainAssessmentTab data={mockHighSeverityData} />);

			expect(screen.getByText('9/10')).toBeInTheDocument();
			expect(screen.getByText('Severe Pain')).toBeInTheDocument();
		});

		it('shows low severity for pain intensity 2/10', () => {
			render(<PainAssessmentTab data={mockLowSeverityData} />);

			expect(screen.getByText('2/10')).toBeInTheDocument();
			expect(screen.getByText('Mild Pain')).toBeInTheDocument();
		});

		it('displays pain scale reference text', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			expect(
				screen.getByText('0 = No pain, 10 = Worst imaginable pain')
			).toBeInTheDocument();
		});

		it('shows empty state when intensity not assessed', () => {
			const noIntensity: TPainData = { locations: ['Back'] };
			render(<PainAssessmentTab data={noIntensity} />);

			expect(screen.getByText(/Pain intensity not assessed/i)).toBeInTheDocument();
		});

		it('handles zero intensity', () => {
			const zeroIntensity: TPainData = { intensity: 0 };
			render(<PainAssessmentTab data={zeroIntensity} />);

			expect(screen.getByText('0/10')).toBeInTheDocument();
			expect(screen.getByText('Mild Pain')).toBeInTheDocument();
		});
	});

	describe('Pain Characteristics Display (AC-2.2.4)', () => {
		it('renders pain characteristics as tags', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			expect(screen.getByText('Sharp')).toBeInTheDocument();
			expect(screen.getByText('Aching')).toBeInTheDocument();
			expect(screen.getByText('Stabbing')).toBeInTheDocument();
		});

		it('shows empty state when no characteristics', () => {
			const noCharacteristics: TPainData = { intensity: 5 };
			render(<PainAssessmentTab data={noCharacteristics} />);

			expect(screen.getByText(/No characteristics reported/i)).toBeInTheDocument();
		});

		it('handles multiple characteristics', () => {
			const multipleChars: TPainData = {
				characteristics: ['Sharp', 'Dull', 'Burning', 'Throbbing', 'Shooting'],
			};
			render(<PainAssessmentTab data={multipleChars} />);

			expect(screen.getByText('Sharp')).toBeInTheDocument();
			expect(screen.getByText('Dull')).toBeInTheDocument();
			expect(screen.getByText('Burning')).toBeInTheDocument();
			expect(screen.getByText('Throbbing')).toBeInTheDocument();
			expect(screen.getByText('Shooting')).toBeInTheDocument();
		});
	});

	describe('Temporal Patterns Display (AC-2.2.5)', () => {
		it('displays temporal patterns with labels', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			expect(screen.getByText('Frequency:')).toBeInTheDocument();
			expect(screen.getByText('Intermittent')).toBeInTheDocument();
			expect(screen.getByText('Duration:')).toBeInTheDocument();
			expect(screen.getByText('Present for 6 months')).toBeInTheDocument();
			expect(screen.getByText('Time of day:')).toBeInTheDocument();
			expect(screen.getByText('Morning stiffness, evening pain')).toBeInTheDocument();
			expect(screen.getByText('Aggravating factors:')).toBeInTheDocument();
			expect(screen.getByText(/Sitting >30 minutes/i)).toBeInTheDocument();
			expect(screen.getByText('Relieving factors:')).toBeInTheDocument();
			expect(screen.getByText(/Heat, gentle movement/i)).toBeInTheDocument();
		});

		it('shows empty state when no temporal patterns', () => {
			const noPatterns: TPainData = { intensity: 5 };
			render(<PainAssessmentTab data={noPatterns} />);

			expect(screen.getByText(/No temporal patterns documented/i)).toBeInTheDocument();
		});

		it('handles partial temporal patterns', () => {
			const partialPatterns: TPainData = {
				temporalPatterns: {
					frequency: 'Constant',
					duration: '2 weeks',
				},
			};
			render(<PainAssessmentTab data={partialPatterns} />);

			expect(screen.getByText('Frequency:')).toBeInTheDocument();
			expect(screen.getByText('Constant')).toBeInTheDocument();
			expect(screen.getByText('Duration:')).toBeInTheDocument();
			expect(screen.getByText('2 weeks')).toBeInTheDocument();
		});
	});

	describe('Functional Impact Display (AC-2.2.6)', () => {
		it('shows functional impact with severity indicators', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			expect(screen.getByText('Mobility:')).toBeInTheDocument();
			expect(screen.getByText(/Difficulty walking/i)).toBeInTheDocument();
			expect(screen.getByText('Sleep:')).toBeInTheDocument();
			expect(screen.getByText(/Wakes 2-3 times/i)).toBeInTheDocument();
			expect(screen.getByText('Work/Activities:')).toBeInTheDocument();
			expect(screen.getByText(/Unable to sit at desk/i)).toBeInTheDocument();
			expect(screen.getByText('Self-care:')).toBeInTheDocument();
			expect(screen.getByText(/Difficulty with sock/i)).toBeInTheDocument();
		});

		it('shows empty state when no functional impact', () => {
			const noImpact: TPainData = { intensity: 5 };
			render(<PainAssessmentTab data={noImpact} />);

			expect(screen.getByText(/No functional impact reported/i)).toBeInTheDocument();
		});

		it('handles partial functional impact data', () => {
			const partialImpact: TPainData = {
				functionalImpact: {
					mobility: {
						description: 'Limited walking',
						severity: 'high',
					},
				},
			};
			render(<PainAssessmentTab data={partialImpact} />);

			expect(screen.getByText('Mobility:')).toBeInTheDocument();
			expect(screen.getByText('Limited walking')).toBeInTheDocument();
			expect(screen.queryByText('Sleep:')).not.toBeInTheDocument();
		});

		it('handles impact without severity', () => {
			const noSeverity: TPainData = {
				functionalImpact: {
					mobility: {
						description: 'Some difficulty',
					},
				},
			};
			render(<PainAssessmentTab data={noSeverity} />);

			expect(screen.getByText('Some difficulty')).toBeInTheDocument();
		});
	});

	describe('SeverityIndicator Component Usage (AC-2.2.7)', () => {
		it('SeverityIndicator component used correctly', () => {
			const { container } = render(<PainAssessmentTab data={mockCompleteData} />);

			// Check that SeverityIndicator components are rendered
			const severityIndicators = container.querySelectorAll(
				'[data-testid="severity-indicator"]'
			);
			expect(severityIndicators.length).toBeGreaterThan(0);
		});

		it('maps intensity 0-3 to low severity', () => {
			render(<PainAssessmentTab data={mockLowSeverityData} />);

			expect(screen.getByText('Mild Pain')).toBeInTheDocument();
		});

		it('maps intensity 4-6 to medium severity', () => {
			const mediumData: TPainData = { intensity: 5 };
			render(<PainAssessmentTab data={mediumData} />);

			expect(screen.getByText('Moderate Pain')).toBeInTheDocument();
		});

		it('maps intensity 7-10 to high severity', () => {
			render(<PainAssessmentTab data={mockHighSeverityData} />);

			expect(screen.getByText('Severe Pain')).toBeInTheDocument();
		});
	});

	describe('Empty State Handling (AC-2.2.10)', () => {
		it('shows global empty state when all pain data missing', () => {
			render(<PainAssessmentTab data={mockEmptyData} />);

			expect(screen.getByText(/No pain assessment data available/i)).toBeInTheDocument();
		});

		it('shows section-specific empty states', () => {
			render(<PainAssessmentTab data={mockMinimalData} />);

			expect(screen.getByText(/No characteristics reported/i)).toBeInTheDocument();
			expect(screen.getByText(/No temporal patterns documented/i)).toBeInTheDocument();
			expect(screen.getByText(/No functional impact reported/i)).toBeInTheDocument();
		});

		it('maintains consistent layout with empty sections', () => {
			render(<PainAssessmentTab data={mockMinimalData} />);

			// Section titles should still render
			expect(screen.getByText('Pain Characteristics')).toBeInTheDocument();
			expect(screen.getByText('Temporal Patterns')).toBeInTheDocument();
			expect(screen.getByText('Impact on Function')).toBeInTheDocument();
		});
	});

	describe('Responsive Layout (AC-2.2.8)', () => {
		it('renders ContentGrid with responsive classes', () => {
			const { container } = render(<PainAssessmentTab data={mockCompleteData} />);

			const contentGrid = container.querySelector('div > div');
			expect(contentGrid).toBeInTheDocument();
		});

		it('renders left and right columns', () => {
			const { container } = render(<PainAssessmentTab data={mockCompleteData} />);

			const columns = container.querySelectorAll('div > div > div');
			expect(columns.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('Edge Cases', () => {
		it('handles undefined data gracefully', () => {
			// @ts-expect-error Testing undefined data
			render(<PainAssessmentTab data={undefined} />);

			expect(screen.getByText(/No pain assessment data available/i)).toBeInTheDocument();
		});

		it('handles null intensity', () => {
			const nullIntensity: TPainData = { intensity: null as unknown as number };
			render(<PainAssessmentTab data={nullIntensity} />);

			expect(screen.getByText(/Pain intensity not assessed/i)).toBeInTheDocument();
		});

		it('handles empty locations array', () => {
			const emptyLocations: TPainData = { locations: [] };
			render(<PainAssessmentTab data={emptyLocations} />);

			expect(screen.getByText(/No pain locations reported/i)).toBeInTheDocument();
		});

		it('handles empty characteristics array', () => {
			const emptyChars: TPainData = { characteristics: [] };
			render(<PainAssessmentTab data={emptyChars} />);

			expect(screen.getByText(/No characteristics reported/i)).toBeInTheDocument();
		});

		it('handles empty temporal patterns object', () => {
			const emptyPatterns: TPainData = { temporalPatterns: {} };
			render(<PainAssessmentTab data={emptyPatterns} />);

			expect(screen.getByText(/No temporal patterns documented/i)).toBeInTheDocument();
		});

		it('handles empty functional impact object', () => {
			const emptyImpact: TPainData = { functionalImpact: {} };
			render(<PainAssessmentTab data={emptyImpact} />);

			expect(screen.getByText(/No functional impact reported/i)).toBeInTheDocument();
		});
	});

	describe('Integration Tests', () => {
		it('renders complete pain assessment flow', () => {
			render(<PainAssessmentTab data={mockCompleteData} />);

			// All sections present
			expect(screen.getByText('Pain Locations')).toBeInTheDocument();
			expect(screen.getByText('Pain Intensity')).toBeInTheDocument();
			expect(screen.getByText('Pain Characteristics')).toBeInTheDocument();
			expect(screen.getByText('Temporal Patterns')).toBeInTheDocument();
			expect(screen.getByText('Impact on Function')).toBeInTheDocument();

			// Data displayed correctly
			expect(screen.getByText(/Lower Back.*Primary/i)).toBeInTheDocument();
			expect(screen.getByText('6/10')).toBeInTheDocument();
			expect(screen.getByText('Sharp')).toBeInTheDocument();
			expect(screen.getByText('Intermittent')).toBeInTheDocument();
			expect(screen.getByText(/Difficulty walking/i)).toBeInTheDocument();
		});

		it('handles mixed data states correctly', () => {
			const mixedData: TPainData = {
				locations: ['Back'],
				intensity: 7,
				// No characteristics
				temporalPatterns: {
					frequency: 'Constant',
				},
				// No functional impact
			};
			render(<PainAssessmentTab data={mixedData} />);

			// Present data
			expect(screen.getByText('Back')).toBeInTheDocument();
			expect(screen.getByText('7/10')).toBeInTheDocument();
			expect(screen.getByText('Constant')).toBeInTheDocument();

			// Empty states
			expect(screen.getByText(/No characteristics reported/i)).toBeInTheDocument();
			expect(screen.getByText(/No functional impact reported/i)).toBeInTheDocument();
		});
	});
});
