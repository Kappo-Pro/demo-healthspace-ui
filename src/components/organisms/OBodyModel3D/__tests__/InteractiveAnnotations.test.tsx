/**
 * InteractiveAnnotations Component Tests
 *
 * Test suite for interactive 3D body model with measurement annotations.
 *
 * @module organisms/OBodyModel3D/__tests__
 * @since EPIC-001-S13
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveAnnotations } from '../InteractiveAnnotations';
import type { BodyMeasurementResult } from '@utils/bodyMeasurement';
import type { ComparisonData, ProgressEntry } from '../types/annotations';

// Mock dependencies
jest.mock('@react-three/fiber', () => ({
	Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
	useThree: () => ({
		camera: { position: [0, 1, 3] },
		gl: { domElement: document.createElement('canvas') },
	}),
}));

jest.mock('@react-three/drei', () => ({
	OrbitControls: () => <div data-testid="orbit-controls" />,
}));

// Mock measurement result
const mockMeasurementResult: BodyMeasurementResult = {
	measurements: {
		segments: [
			{
				segment: 'torso-length',
				lengthCm: 60,
				confidence: 0.95,
			},
		],
		circumferences: [
			{
				bodyPart: 'chest',
				circumferenceCm: 90,
				confidence: 0.92,
			},
		],
		ratios: [],
		symmetry: [],
	},
	calibration: {
		pixelsPerCm: 10,
		confidence: 0.9,
		noseToAnklePixels: 1000,
		userHeightCm: 175,
		imageHeight: 720,
	},
	metadata: {
		timestamp: '2025-01-01T00:00:00Z',
		processingTime: 100,
		totalMeasurements: 2,
		averageConfidence: 0.93,
		symmetryScore: 95,
	},
	qualityFlags: {
		calibrationValid: true,
		allLandmarksVisible: true,
		lowConfidenceCount: 0,
	},
};

describe('InteractiveAnnotations', () => {
	it('should render without crashing', () => {
		render(<InteractiveAnnotations currentMeasurement={mockMeasurementResult} />);

		expect(screen.getByTestId('interactive-annotations')).toBeInTheDocument();
	});

	it('should display title', () => {
		render(<InteractiveAnnotations currentMeasurement={mockMeasurementResult} />);

		expect(screen.getByText(/3D Body Measurements/i)).toBeInTheDocument();
	});

	it('should render 3D canvas', () => {
		render(<InteractiveAnnotations currentMeasurement={mockMeasurementResult} />);

		expect(screen.getByTestId('canvas')).toBeInTheDocument();
	});

	it('should render orbit controls', () => {
		render(<InteractiveAnnotations currentMeasurement={mockMeasurementResult} />);

		expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
	});

	it('should show model tab by default', () => {
		render(<InteractiveAnnotations currentMeasurement={mockMeasurementResult} />);

		expect(screen.getByText(/3D Model/i)).toBeInTheDocument();
	});

	it('should show comparison tab when comparison data provided', () => {
		const comparisonData: ComparisonData = {
			id: 'comparison-1',
			before: mockMeasurementResult,
			after: mockMeasurementResult,
			daysBetween: 14,
			overallChange: 5,
			changes: [],
		};

		render(
			<InteractiveAnnotations
				currentMeasurement={mockMeasurementResult}
				comparisonData={comparisonData}
			/>
		);

		expect(screen.getByText(/Comparison/i)).toBeInTheDocument();
	});

	it('should show progress tab when progress entries provided', () => {
		const progressEntries: ProgressEntry[] = [
			{
				date: '2025-01-01',
				result: mockMeasurementResult,
				score: 80,
			},
		];

		render(
			<InteractiveAnnotations
				currentMeasurement={mockMeasurementResult}
				progressEntries={progressEntries}
			/>
		);

		expect(screen.getByText(/Progress/i)).toBeInTheDocument();
	});

	it('should render reset view button', () => {
		render(<InteractiveAnnotations currentMeasurement={mockMeasurementResult} />);

		expect(screen.getByText(/Reset View/i)).toBeInTheDocument();
	});

	it('should handle reset view click', () => {
		render(<InteractiveAnnotations currentMeasurement={mockMeasurementResult} />);

		const resetButton = screen.getByText(/Reset View/i);
		fireEvent.click(resetButton);

		// Should not crash
		expect(screen.getByTestId('interactive-annotations')).toBeInTheDocument();
	});
});
