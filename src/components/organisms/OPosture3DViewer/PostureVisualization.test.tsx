import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostureVisualization } from './PostureVisualization';
import { PoseLandmark } from './Posture3DViewer';

// Mock the lazy-loaded components
jest.mock('./Posture3DViewerLazy', () => ({
	Posture3DViewerLazy: jest.fn(({ landmarks, deviationDegrees }) => (
		<div data-testid="posture-3d-viewer-lazy">
			3D Viewer - {landmarks.length} landmarks - {deviationDegrees}°
		</div>
	)),
}));

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

// Mock WebGL context
const mockGetContext = jest.fn(() => ({
	getParameter: jest.fn(),
}));

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
	value: mockGetContext,
});

describe('PostureVisualization Integration', () => {
	const mockLandmarks: PoseLandmark[] = Array.from({ length: 33 }, (_, i) => ({
		x: i / 33,
		y: i / 33,
		z: i / 33,
		visibility: 1,
	}));

	beforeEach(() => {
		localStorageMock.clear();
		mockGetContext.mockClear();
		// Mock successful WebGL detection
		mockGetContext.mockReturnValue({
			getParameter: jest.fn(),
		});
	});

	describe('Rendering', () => {
		it('should render with WebGL context', () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			expect(screen.getByRole('radiogroup')).toBeInTheDocument();
		});

		it('should render view selector', () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			expect(
				screen.getByRole('radio', { name: /2D View/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole('radio', { name: /3D View/i }),
			).toBeInTheDocument();
		});

		it('should default to 2D view', () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			const radio2D = screen.getByRole('radio', { name: /2D View/i });
			expect(radio2D).toHaveAttribute('aria-checked', 'true');
		});
	});

	describe('View Switching', () => {
		it('should switch to 3D view when toggle clicked', async () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			fireEvent.click(radio3D);

			await waitFor(() => {
				expect(radio3D).toHaveAttribute('aria-checked', 'true');
			});
		});

		it('should show default 2D view in 2D mode', () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			expect(
				screen.getByRole('region', { name: /2D posture view/i }),
			).toBeInTheDocument();
			expect(screen.getByText(/Posture Analysis/i)).toBeInTheDocument();
		});

		it('should show 3D viewer in 3D mode', async () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			fireEvent.click(radio3D);

			await waitFor(() => {
				expect(
					screen.getByTestId('posture-3d-viewer-lazy'),
				).toBeInTheDocument();
			});
		});
	});

	describe('Preference Persistence', () => {
		it('should save preference to localStorage', async () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			fireEvent.click(radio3D);

			await waitFor(() => {
				expect(localStorageMock.getItem('posture-view-preference')).toBe('3d');
			});
		});

		it('should load preference from localStorage', () => {
			localStorageMock.setItem('posture-view-preference', '3d');

			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			expect(radio3D).toHaveAttribute('aria-checked', 'true');
		});
	});

	describe('Custom 2D Fallback', () => {
		it('should render custom fallback 2D view', () => {
			const customFallback = <div data-testid="custom-2d">Custom 2D View</div>;

			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
					fallback2DView={customFallback}
				/>,
			);

			expect(screen.getByTestId('custom-2d')).toBeInTheDocument();
			expect(screen.queryByText(/Posture Analysis/i)).not.toBeInTheDocument();
		});
	});

	describe('WebGL Detection', () => {
		it('should disable 3D when WebGL not supported', () => {
			// Mock failed WebGL detection
			mockGetContext.mockReturnValue(null);

			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			expect(radio3D).toBeDisabled();
			expect(radio3D).toHaveAttribute(
				'title',
				'3D view requires WebGL support',
			);
		});

		it('should enable 3D when WebGL is supported', () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			expect(radio3D).not.toBeDisabled();
		});
	});

	describe('Props Forwarding', () => {
		it('should forward landmarks to 3D viewer', async () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={15}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			fireEvent.click(radio3D);

			await waitFor(() => {
				expect(screen.getByTestId('posture-3d-viewer-lazy')).toHaveTextContent(
					'33 landmarks',
				);
			});
		});

		it('should forward deviationDegrees to 3D viewer', async () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={15.5}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			fireEvent.click(radio3D);

			await waitFor(() => {
				expect(screen.getByTestId('posture-3d-viewer-lazy')).toHaveTextContent(
					'15.5°',
				);
			});
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA labels', () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			expect(
				screen.getByRole('radiogroup', { name: /Select posture view mode/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole('region', { name: /2D posture view/i }),
			).toBeInTheDocument();
		});

		it('should be keyboard navigable', async () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			const radio3D = screen.getByRole('radio', { name: /3D View/i });
			radio3D.focus();
			fireEvent.keyDown(radio3D, { key: 'Enter' });

			await waitFor(() => {
				expect(radio3D).toHaveAttribute('aria-checked', 'true');
			});
		});
	});

	describe('Default 2D View', () => {
		it('should display landmark count', () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={10}
				/>,
			);

			expect(screen.getByText('33 / 33')).toBeInTheDocument();
		});

		it('should display deviation degrees', () => {
			render(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={15.7}
				/>,
			);

			expect(screen.getByText('15.7°')).toBeInTheDocument();
		});

		it('should display quality based on deviation', () => {
			const { rerender } = render(
				<PostureVisualization landmarks={mockLandmarks} deviationDegrees={3} />,
			);

			expect(screen.getByText('Excellent')).toBeInTheDocument();

			rerender(
				<PostureVisualization landmarks={mockLandmarks} deviationDegrees={8} />,
			);

			expect(screen.getByText('Good')).toBeInTheDocument();

			rerender(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={12}
				/>,
			);

			expect(screen.getByText('Fair')).toBeInTheDocument();

			rerender(
				<PostureVisualization
					landmarks={mockLandmarks}
					deviationDegrees={20}
				/>,
			);

			expect(screen.getByText('Poor')).toBeInTheDocument();
		});
	});
});
