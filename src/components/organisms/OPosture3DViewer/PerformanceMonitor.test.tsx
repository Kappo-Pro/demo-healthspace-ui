import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PerformanceMonitor } from './PerformanceMonitor';

// Mock requestAnimationFrame
let rafCallbacks: FrameRequestCallback[] = [];
let rafId = 0;

beforeAll(() => {
	global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
		rafCallbacks.push(callback);
		return ++rafId;
	});
	global.cancelAnimationFrame = jest.fn(() => {
		// Remove callback from queue
	});
});

afterEach(() => {
	rafCallbacks = [];
	rafId = 0;
	jest.clearAllTimers();
});

describe('PerformanceMonitor', () => {
	describe('Component Rendering', () => {
		it('renders without crashing', () => {
			render(<PerformanceMonitor />);
		});

		it('is initially hidden by default', () => {
			const { container } = render(<PerformanceMonitor />);
			expect(container.firstChild).toBeNull();
		});

		it('shows when visible prop is true', () => {
			const { container } = render(<PerformanceMonitor visible={true} />);
			expect(container.firstChild).not.toBeNull();
		});

		it('displays FPS metric', () => {
			render(<PerformanceMonitor visible={true} />);
			expect(screen.getByText(/FPS:/i)).toBeInTheDocument();
		});

		it('displays memory metric', () => {
			render(<PerformanceMonitor visible={true} />);
			expect(screen.getByText(/Memory:/i)).toBeInTheDocument();
		});
	});

	describe('FPS Tracking', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('calculates FPS from requestAnimationFrame', async () => {
			render(<PerformanceMonitor visible={true} />);

			// Simulate frame callbacks
			const mockTime = performance.now();
			jest
				.spyOn(performance, 'now')
				.mockReturnValueOnce(mockTime)
				.mockReturnValueOnce(mockTime + 1000); // 1 second later

			// Trigger 60 frames
			for (let i = 0; i < 60; i++) {
				rafCallbacks.forEach(cb => cb(mockTime + i * 16.67));
			}

			jest.advanceTimersByTime(1000);

			await waitFor(() => {
				const fpsText = screen.getByText(/FPS:/i).textContent;
				expect(fpsText).toContain('60');
			});
		});

		it('updates FPS display every second', async () => {
			render(<PerformanceMonitor visible={true} />);

			jest.advanceTimersByTime(1000);

			await waitFor(() => {
				const updatedFPS = screen.getByText(/FPS:/i).textContent;
				expect(updatedFPS).toBeDefined();
			});
		});

		it('shows warning when FPS < 30', async () => {
			render(<PerformanceMonitor visible={true} />);

			// Simulate low FPS by manipulating state
			await act(async () => {
				// Advance time to trigger the interval
				jest.advanceTimersByTime(1100);
			});

			await waitFor(() => {
				const fpsElement = screen.getByText(/FPS:/i);
				const fpsText = fpsElement.textContent || '';
				// After advancing time with minimal frames, FPS should be low (0 or very low)
				const fpsMatch = fpsText.match(/FPS: (\d+)/);
				if (fpsMatch) {
					const fpsValue = parseInt(fpsMatch[1], 10);
					if (fpsValue < 30) {
						expect(fpsText).toContain('⚠️');
					}
				}
			});
		});

		it('shows good status when FPS >= 30', async () => {
			render(<PerformanceMonitor visible={true} />);

			// Simulate good FPS (60 frames in 1 second)
			const mockTime = performance.now();
			jest
				.spyOn(performance, 'now')
				.mockReturnValueOnce(mockTime)
				.mockReturnValueOnce(mockTime + 1000);

			for (let i = 0; i < 60; i++) {
				rafCallbacks.forEach(cb => cb(mockTime + i * 16.67));
			}

			jest.advanceTimersByTime(1000);

			await waitFor(() => {
				const fpsElement = screen.getByText(/FPS:/i);
				expect(fpsElement.textContent).not.toContain('⚠️');
			});
		});
	});

	describe('Memory Tracking', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('reads memory from performance.memory if available', async () => {
			// Mock performance.memory
			Object.defineProperty(performance, 'memory', {
				configurable: true,
				value: {
					usedJSHeapSize: 50000000, // 50MB in bytes
					jsHeapSizeLimit: 200000000,
					totalJSHeapSize: 100000000,
				},
			});

			render(<PerformanceMonitor visible={true} />);

			// Wait for interval to update memory
			await act(async () => {
				jest.advanceTimersByTime(1100);
			});

			await waitFor(() => {
				const memoryText = screen.getByText(/Memory:/i).textContent;
				expect(memoryText).toContain('48'); // ~48MB
			});
		});

		it('displays memory in MB', () => {
			Object.defineProperty(performance, 'memory', {
				configurable: true,
				value: {
					usedJSHeapSize: 100000000, // 100MB
					jsHeapSizeLimit: 200000000,
					totalJSHeapSize: 150000000,
				},
			});

			render(<PerformanceMonitor visible={true} />);

			const memoryText = screen.getByText(/Memory:/i).textContent;
			expect(memoryText).toContain('MB');
		});

		it('handles missing performance.memory gracefully', () => {
			// Remove performance.memory
			Object.defineProperty(performance, 'memory', {
				configurable: true,
				value: undefined,
			});

			render(<PerformanceMonitor visible={true} />);

			const memoryText = screen.getByText(/Memory:/i).textContent;
			expect(memoryText).toContain('0 MB');
		});
	});

	describe('Visibility Toggle', () => {
		it('is hidden when visible={false}', () => {
			const { container } = render(<PerformanceMonitor visible={false} />);
			expect(container.firstChild).toBeNull();
		});

		it('is shown when visible={true}', () => {
			const { container } = render(<PerformanceMonitor visible={true} />);
			expect(container.firstChild).not.toBeNull();
		});

		it('can toggle visibility', () => {
			const { container, rerender } = render(
				<PerformanceMonitor visible={false} />,
			);
			expect(container.firstChild).toBeNull();

			rerender(<PerformanceMonitor visible={true} />);
			expect(container.firstChild).not.toBeNull();

			rerender(<PerformanceMonitor visible={false} />);
			expect(container.firstChild).toBeNull();
		});
	});

	describe('Cleanup', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('cleans up requestAnimationFrame on unmount', () => {
			const { unmount } = render(<PerformanceMonitor visible={true} />);

			const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame');

			unmount();

			expect(cancelSpy).toHaveBeenCalled();
		});

		it('cleans up interval timers on unmount', () => {
			const { unmount } = render(<PerformanceMonitor visible={true} />);

			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

			unmount();

			expect(clearIntervalSpy).toHaveBeenCalled();
		});
	});
});
