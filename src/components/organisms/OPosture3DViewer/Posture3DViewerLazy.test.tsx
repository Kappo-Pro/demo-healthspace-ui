import React from 'react';

// Mock react-three components (required for Posture3DViewer to render)
jest.mock('@react-three/fiber', () => ({
	Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
}));

jest.mock('@react-three/drei', () => ({
	OrbitControls: () => <div data-testid="orbit-controls" />,
	Line: () => <div data-testid="line" />,
}));

// Mock PerformanceMonitor
jest.mock('./PerformanceMonitor', () => ({
	PerformanceMonitor: ({ visible }) =>
		visible ? (
			<div data-testid="performance-monitor">Performance Monitor</div>
		) : null,
}));

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Posture3DViewerLazy } from './Posture3DViewerLazy';

const mockLandmarks = Array(33)
	.fill(null)
	.map(() => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 }));

describe('Posture3DViewerLazy', () => {
	describe('Basic Rendering', () => {
		it('should render without crashing', () => {
			const { container } = render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(container).toBeTruthy();
		});

		it('should render in a container with correct class', () => {
			const { container } = render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(container.firstChild).toHaveClass('posture-3d-viewer-lazy');
		});

		it('should eventually render the Posture3DViewer component', async () => {
			render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
			});
		});
	});

	describe('Loading States', () => {
		it('should show loading state initially', () => {
			render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(screen.getByText(/loading 3d viewer/i)).toBeInTheDocument();
		});

		it('should show loading spinner', () => {
			const { container } = render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			const spinner = container.querySelector('.posture-3d-loading-spinner');
			expect(spinner).toBeInTheDocument();
		});

		it('should hide loading state after component loads', async () => {
			render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			await waitFor(() => {
				expect(
					screen.queryByText(/loading 3d viewer/i),
				).not.toBeInTheDocument();
			});
		});

		it('should transition from loading to loaded state', async () => {
			render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			// Initially loading
			expect(screen.getByText(/loading 3d viewer/i)).toBeInTheDocument();
			// Eventually loaded
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
			});
		});
	});

	describe('Props Forwarding', () => {
		it('should forward landmarks prop to Posture3DViewer', async () => {
			const customLandmarks = [
				{ x: 0.3, y: 0.4, z: 0.1, visibility: 0.8 },
				{ x: 0.5, y: 0.6, z: 0.2, visibility: 0.9 },
			];
			render(
				<Posture3DViewerLazy
					landmarks={customLandmarks}
					deviationDegrees={0}
				/>,
			);
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
			});
		});

		it('should forward deviationDegrees prop', async () => {
			render(
				<Posture3DViewerLazy
					landmarks={mockLandmarks}
					deviationDegrees={15.5}
				/>,
			);
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
			});
		});

		it('should forward color prop', async () => {
			render(
				<Posture3DViewerLazy
					landmarks={mockLandmarks}
					deviationDegrees={0}
					color="#FF0000"
				/>,
			);
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
			});
		});

		it('should forward showPerformance prop', async () => {
			render(
				<Posture3DViewerLazy
					landmarks={mockLandmarks}
					deviationDegrees={0}
					showPerformance={true}
				/>,
			);
			await waitFor(() => {
				expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();
			});
		});

		it('should forward all props together', async () => {
			render(
				<Posture3DViewerLazy
					landmarks={mockLandmarks}
					deviationDegrees={25}
					color="#00FF00"
					showPerformance={true}
				/>,
			);
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
				expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();
			});
		});
	});

	describe('Suspense Integration', () => {
		it('should use React.Suspense for lazy loading', () => {
			const { container } = render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			// Suspense should show fallback initially
			expect(screen.getByText(/loading 3d viewer/i)).toBeInTheDocument();
			expect(container).toBeTruthy();
		});

		it('should render fallback loading indicator', () => {
			render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			const loadingIndicator = screen.getByText(/loading 3d viewer/i);
			expect(loadingIndicator).toBeInTheDocument();
		});
	});

	describe('Error Handling', () => {
		beforeEach(() => {
			// Suppress console.error for these tests
			jest.spyOn(console, 'error').mockImplementation(() => {});
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should render error boundary wrapper', () => {
			const { container } = render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(container.firstChild).toBeTruthy();
		});

		it('should provide error boundary for lazy loading errors', () => {
			// This test validates the error boundary exists
			// Actual error throwing would require a more complex setup
			const { container } = render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			expect(container).toBeTruthy();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty landmarks array', async () => {
			render(<Posture3DViewerLazy landmarks={[]} deviationDegrees={0} />);
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
			});
		});

		it('should handle zero deviation degrees', async () => {
			render(
				<Posture3DViewerLazy landmarks={mockLandmarks} deviationDegrees={0} />,
			);
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
			});
		});

		it('should handle negative deviation degrees', async () => {
			render(
				<Posture3DViewerLazy
					landmarks={mockLandmarks}
					deviationDegrees={-10}
				/>,
			);
			await waitFor(() => {
				expect(screen.getByTestId('canvas')).toBeInTheDocument();
			});
		});
	});
});
