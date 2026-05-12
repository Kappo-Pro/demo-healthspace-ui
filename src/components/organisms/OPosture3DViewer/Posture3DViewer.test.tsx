import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-three components
jest.mock('@react-three/fiber', () => ({
	Canvas: ({ children }: { children: React.ReactNode }) =>
		React.createElement('div', { 'data-testid': 'canvas' }, children),
	useThree: () => ({
		camera: {
			position: { x: 0, y: 0, z: 3 },
		},
		controls: {
			target: { x: 0, y: 0, z: 0 },
			update: jest.fn(),
		},
	}),
}));

jest.mock('@react-three/drei', () => ({
	OrbitControls: () =>
		React.createElement('div', { 'data-testid': 'orbit-controls' }),
	Line: () => React.createElement('div', { 'data-testid': 'line' }),
}));

// Mock PerformanceMonitor
jest.mock('./PerformanceMonitor', () => ({
	PerformanceMonitor: ({ visible }: { visible?: boolean }) =>
		visible
			? React.createElement(
					'div',
					{ className: 'performance-monitor' },
					'Performance Monitor',
				)
			: null,
}));

// Mock CameraPresets
jest.mock('./CameraPresets', () => ({
	CameraPresets: () => null,
}));

// Mock animation utility
jest.mock('./utils/animateCamera', () => ({
	animateCamera: jest.fn(() => jest.fn()),
}));

// Mock camera presets
jest.mock('./utils/cameraPresets', () => ({
	CAMERA_PRESETS: {
		front: {
			name: 'front',
			position: [0, 0, 3],
			lookAt: [0, 0, 0],
			label: 'Front View',
			shortcut: '1',
		},
		side: {
			name: 'side',
			position: [3, 0, 0],
			lookAt: [0, 0, 0],
			label: 'Side View',
			shortcut: '2',
		},
		top: {
			name: 'top',
			position: [0, 3, 0],
			lookAt: [0, 0, 0],
			label: 'Top View',
			shortcut: '3',
		},
		diagonal: {
			name: 'diagonal',
			position: [2, 2, 2],
			lookAt: [0, 0, 0],
			label: 'Diagonal View',
			shortcut: '4',
		},
	},
}));

import Posture3DViewer from './Posture3DViewer';

interface MockLandmark {
	x: number;
	y: number;
	z: number;
	visibility?: number;
}

describe('Posture3DViewer', () => {
	const mockLandmarks: MockLandmark[] = Array(33)
		.fill(null)
		.map(() => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 }));

	describe('Basic Rendering', () => {
		it('should render without crashing', () => {
			const { container } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(container).toBeTruthy();
		});

		it('should render canvas', () => {
			render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(screen.getByTestId('canvas')).toBeInTheDocument();
		});

		it('should render orbit controls', () => {
			render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
		});

		it('should apply custom color if provided', () => {
			const { container } = render(
				<Posture3DViewer
					landmarks={mockLandmarks}
					deviationDegrees={0}
					color="#FF0000"
				/>,
			);
			expect(container).toBeTruthy();
		});
	});

	describe('Performance Monitoring', () => {
		it('should not render PerformanceMonitor by default', () => {
			const { container } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(
				container.querySelector('.performance-monitor'),
			).not.toBeInTheDocument();
		});

		it('should render PerformanceMonitor when showPerformance is true', () => {
			const { container } = render(
				<Posture3DViewer
					landmarks={mockLandmarks}
					deviationDegrees={0}
					showPerformance={true}
				/>,
			);
			expect(
				container.querySelector('.performance-monitor'),
			).toBeInTheDocument();
		});

		it('should hide PerformanceMonitor when showPerformance is false', () => {
			const { container } = render(
				<Posture3DViewer
					landmarks={mockLandmarks}
					deviationDegrees={0}
					showPerformance={false}
				/>,
			);
			expect(
				container.querySelector('.performance-monitor'),
			).not.toBeInTheDocument();
		});
	});

	describe('Props Interface', () => {
		it('should accept landmarks prop', () => {
			const customLandmarks: MockLandmark[] = [
				{ x: 0.3, y: 0.4, z: 0.1, visibility: 0.8 },
			];
			render(
				<Posture3DViewer landmarks={customLandmarks} deviationDegrees={0} />,
			);
			expect(screen.getByTestId('canvas')).toBeInTheDocument();
		});

		it('should accept deviationDegrees prop', () => {
			render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={15} />,
			);
			expect(screen.getByTestId('canvas')).toBeInTheDocument();
		});

		it('should accept optional color prop', () => {
			render(
				<Posture3DViewer
					landmarks={mockLandmarks}
					deviationDegrees={0}
					color="#00FF00"
				/>,
			);
			expect(screen.getByTestId('canvas')).toBeInTheDocument();
		});

		it('should accept optional showPerformance prop', () => {
			render(
				<Posture3DViewer
					landmarks={mockLandmarks}
					deviationDegrees={0}
					showPerformance={true}
				/>,
			);
			expect(screen.getByTestId('canvas')).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty landmarks array', () => {
			const { container } = render(
				<Posture3DViewer landmarks={[]} deviationDegrees={0} />,
			);
			expect(container).toBeTruthy();
		});

		it('should handle zero deviation degrees', () => {
			render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(screen.getByTestId('canvas')).toBeInTheDocument();
		});

		it('should handle negative deviation degrees', () => {
			render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={-5} />,
			);
			expect(screen.getByTestId('canvas')).toBeInTheDocument();
		});

		it('should handle large deviation degrees', () => {
			render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={90} />,
			);
			expect(screen.getByTestId('canvas')).toBeInTheDocument();
		});
	});

	describe('ARIA Accessibility', () => {
		it('should have region role with aria-label', () => {
			const { container } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			const region = container.querySelector('[role="region"]');
			expect(region).toBeInTheDocument();
			expect(region).toHaveAttribute('aria-label', '3D Posture Viewer');
		});

		it('should have aria-describedby for keyboard instructions', () => {
			const { container } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			const region = container.querySelector('.posture-3d-viewer');
			expect(region).toHaveAttribute(
				'aria-describedby',
				'posture-keyboard-instructions',
			);
		});

		it('should have live region for announcements', () => {
			const { container } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			const liveRegion = container.querySelector(
				'[role="status"][aria-live="polite"]',
			);
			expect(liveRegion).toBeInTheDocument();
			expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
		});

		it('should announce posture quality changes', () => {
			const { container } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={3} />,
			);
			const liveRegion = container.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toContain('Posture quality: excellent');
			expect(liveRegion?.textContent).toContain('Deviation: 3.0 degrees');
		});

		it('should have skip link for keyboard navigation', () => {
			const { container } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			const skipLink = container.querySelector('.skip-link');
			expect(skipLink).toBeInTheDocument();
			expect(skipLink).toHaveAttribute('href', '#posture-controls');
		});

		it('should have aria-labels on info overlay metrics', () => {
			render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={5.5} />,
			);
			const landmarksDiv = screen.getByText(/Landmarks: 33/);
			const deviationDiv = screen.getByText(/Deviation: 5.5°/);

			expect(landmarksDiv).toHaveAttribute(
				'aria-label',
				'33 pose landmarks detected',
			);
			expect(deviationDiv).toHaveAttribute(
				'aria-label',
				'Deviation from ideal posture: 5.5 degrees',
			);
		});

		it('should have keyboard instructions for screen readers', () => {
			render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			const instructions = screen.getByText(
				/Use arrow keys to rotate the 3D view/,
			);
			expect(instructions).toBeInTheDocument();
			expect(instructions).toHaveAttribute(
				'id',
				'posture-keyboard-instructions',
			);
		});

		it('should be focusable for keyboard navigation', () => {
			const { container } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			const viewer = container.querySelector('.posture-3d-viewer');
			expect(viewer).toHaveAttribute('tabIndex', '-1');
		});

		it('should announce different posture quality levels', () => {
			const { container, rerender } = render(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={3} />,
			);
			const liveRegion = container.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toContain('excellent');

			rerender(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={8} />,
			);
			expect(liveRegion?.textContent).toContain('good');

			rerender(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={13} />,
			);
			expect(liveRegion?.textContent).toContain('fair');

			rerender(
				<Posture3DViewer landmarks={mockLandmarks} deviationDegrees={20} />,
			);
			expect(liveRegion?.textContent).toContain('needs attention');
		});
	});
});
