import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CameraPresets } from './CameraPresets';

describe('CameraPresets', () => {
	const mockOnPresetChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Basic Rendering', () => {
		it('should render without crashing', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			expect(screen.getByRole('toolbar')).toBeInTheDocument();
		});

		it('should render 4 preset buttons', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			expect(screen.getByText('Front View')).toBeInTheDocument();
			expect(screen.getByText('Side View')).toBeInTheDocument();
			expect(screen.getByText('Top View')).toBeInTheDocument();
			expect(screen.getByText('Diagonal View')).toBeInTheDocument();
		});

		it('should show keyboard shortcuts in buttons', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			expect(screen.getByText(/1/)).toBeInTheDocument();
			expect(screen.getByText(/2/)).toBeInTheDocument();
			expect(screen.getByText(/3/)).toBeInTheDocument();
			expect(screen.getByText(/4/)).toBeInTheDocument();
		});

		it('should display active preset visually - front active', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const frontButton = screen.getByText('Front View').closest('button');
			const sideButton = screen.getByText('Side View').closest('button');

			expect(frontButton).toHaveClass('active');
			expect(sideButton).not.toHaveClass('active');
		});

		it('should display active preset visually - diagonal active', () => {
			render(
				<CameraPresets
					activePreset="diagonal"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const frontButton = screen.getByText('Front View').closest('button');
			const diagonalButton = screen
				.getByText('Diagonal View')
				.closest('button');

			expect(diagonalButton).toHaveClass('active');
			expect(frontButton).not.toHaveClass('active');
		});
	});

	describe('User Interaction - Mouse', () => {
		it('should call onPresetChange with "front" when Front button clicked', () => {
			render(
				<CameraPresets
					activePreset="side"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			fireEvent.click(screen.getByText('Front View'));

			expect(mockOnPresetChange).toHaveBeenCalledWith('front');
			expect(mockOnPresetChange).toHaveBeenCalledTimes(1);
		});

		it('should call onPresetChange with "side" when Side button clicked', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			fireEvent.click(screen.getByText('Side View'));

			expect(mockOnPresetChange).toHaveBeenCalledWith('side');
			expect(mockOnPresetChange).toHaveBeenCalledTimes(1);
		});

		it('should call onPresetChange with "top" when Top button clicked', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			fireEvent.click(screen.getByText('Top View'));

			expect(mockOnPresetChange).toHaveBeenCalledWith('top');
			expect(mockOnPresetChange).toHaveBeenCalledTimes(1);
		});

		it('should call onPresetChange with "diagonal" when Diagonal button clicked', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			fireEvent.click(screen.getByText('Diagonal View'));

			expect(mockOnPresetChange).toHaveBeenCalledWith('diagonal');
			expect(mockOnPresetChange).toHaveBeenCalledTimes(1);
		});

		it('should allow clicking already active preset', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			fireEvent.click(screen.getByText('Front View'));

			expect(mockOnPresetChange).toHaveBeenCalledWith('front');
		});
	});

	describe('User Interaction - Keyboard Shortcuts', () => {
		it('should call onPresetChange with "front" when "1" key pressed', () => {
			render(
				<CameraPresets
					activePreset="side"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const toolbar = screen.getByRole('toolbar');
			fireEvent.keyDown(toolbar, { key: '1', code: 'Digit1' });

			expect(mockOnPresetChange).toHaveBeenCalledWith('front');
		});

		it('should call onPresetChange with "side" when "2" key pressed', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const toolbar = screen.getByRole('toolbar');
			fireEvent.keyDown(toolbar, { key: '2', code: 'Digit2' });

			expect(mockOnPresetChange).toHaveBeenCalledWith('side');
		});

		it('should call onPresetChange with "top" when "3" key pressed', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const toolbar = screen.getByRole('toolbar');
			fireEvent.keyDown(toolbar, { key: '3', code: 'Digit3' });

			expect(mockOnPresetChange).toHaveBeenCalledWith('top');
		});

		it('should call onPresetChange with "diagonal" when "4" key pressed', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const toolbar = screen.getByRole('toolbar');
			fireEvent.keyDown(toolbar, { key: '4', code: 'Digit4' });

			expect(mockOnPresetChange).toHaveBeenCalledWith('diagonal');
		});

		it('should not call onPresetChange for other keys', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const toolbar = screen.getByRole('toolbar');
			fireEvent.keyDown(toolbar, { key: 'a', code: 'KeyA' });
			fireEvent.keyDown(toolbar, { key: '5', code: 'Digit5' });
			fireEvent.keyDown(toolbar, { key: 'Enter', code: 'Enter' });

			expect(mockOnPresetChange).not.toHaveBeenCalled();
		});

		it('should support keyboard shortcuts when disabled', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
					disabled={true}
				/>,
			);

			const toolbar = screen.getByRole('toolbar');
			fireEvent.keyDown(toolbar, { key: '2', code: 'Digit2' });

			// Should not call when disabled
			expect(mockOnPresetChange).not.toHaveBeenCalled();
		});
	});

	describe('Disabled State', () => {
		it('should disable all buttons when disabled prop is true', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
					disabled={true}
				/>,
			);

			const buttons = screen.getAllByRole('button');

			buttons.forEach(button => {
				expect(button).toBeDisabled();
				expect(button).toHaveAttribute('aria-disabled', 'true');
			});
		});

		it('should not call onPresetChange when disabled button clicked', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
					disabled={true}
				/>,
			);

			fireEvent.click(screen.getByText('Side View'));

			expect(mockOnPresetChange).not.toHaveBeenCalled();
		});

		it('should enable buttons when disabled prop is false', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
					disabled={false}
				/>,
			);

			const buttons = screen.getAllByRole('button');

			buttons.forEach(button => {
				expect(button).not.toBeDisabled();
			});
		});

		it('should enable buttons by default when disabled prop not provided', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const buttons = screen.getAllByRole('button');

			buttons.forEach(button => {
				expect(button).not.toBeDisabled();
			});
		});
	});

	describe('ARIA Accessibility', () => {
		it('should have toolbar role on container', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const toolbar = screen.getByRole('toolbar');
			expect(toolbar).toBeInTheDocument();
		});

		it('should have aria-label on toolbar', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const toolbar = screen.getByRole('toolbar');
			expect(toolbar).toHaveAttribute('aria-label', 'Camera preset views');
		});

		it('should have aria-pressed="true" on active preset button', () => {
			render(
				<CameraPresets
					activePreset="side"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const frontButton = screen.getByText('Front View').closest('button');
			const sideButton = screen.getByText('Side View').closest('button');

			expect(frontButton).toHaveAttribute('aria-pressed', 'false');
			expect(sideButton).toHaveAttribute('aria-pressed', 'true');
		});

		it('should have aria-pressed="false" on inactive preset buttons', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const sideButton = screen.getByText('Side View').closest('button');
			const topButton = screen.getByText('Top View').closest('button');
			const diagonalButton = screen
				.getByText('Diagonal View')
				.closest('button');

			expect(sideButton).toHaveAttribute('aria-pressed', 'false');
			expect(topButton).toHaveAttribute('aria-pressed', 'false');
			expect(diagonalButton).toHaveAttribute('aria-pressed', 'false');
		});

		it('should have aria-label on each button with keyboard shortcut', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const frontButton = screen.getByText('Front View').closest('button');
			const sideButton = screen.getByText('Side View').closest('button');
			const topButton = screen.getByText('Top View').closest('button');
			const diagonalButton = screen
				.getByText('Diagonal View')
				.closest('button');

			expect(frontButton).toHaveAttribute('aria-label', 'Front View (Press 1)');
			expect(sideButton).toHaveAttribute('aria-label', 'Side View (Press 2)');
			expect(topButton).toHaveAttribute('aria-label', 'Top View (Press 3)');
			expect(diagonalButton).toHaveAttribute(
				'aria-label',
				'Diagonal View (Press 4)',
			);
		});

		it('should have proper focus indicators', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const sideButton = screen.getByText('Side View').closest('button');

			// Focus the button
			sideButton?.focus();

			expect(sideButton).toHaveFocus();
		});

		it('should set aria-disabled on disabled buttons', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
					disabled={true}
				/>,
			);

			const buttons = screen.getAllByRole('button');

			buttons.forEach(button => {
				expect(button).toHaveAttribute('aria-disabled', 'true');
			});
		});
	});

	describe('Visual State', () => {
		it('should apply active class to current preset', () => {
			const { rerender } = render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const frontButton = screen.getByText('Front View').closest('button');
			expect(frontButton).toHaveClass('preset-button', 'active');

			rerender(
				<CameraPresets
					activePreset="top"
					onPresetChange={mockOnPresetChange}
				/>,
			);

			const topButton = screen.getByText('Top View').closest('button');
			expect(topButton).toHaveClass('preset-button', 'active');
		});

		it('should apply disabled class when disabled', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
					disabled={true}
				/>,
			);

			const buttons = screen.getAllByRole('button');

			buttons.forEach(button => {
				expect(button).toHaveClass('disabled');
			});
		});

		it('should not apply disabled class when enabled', () => {
			render(
				<CameraPresets
					activePreset="front"
					onPresetChange={mockOnPresetChange}
					disabled={false}
				/>,
			);

			const buttons = screen.getAllByRole('button');

			buttons.forEach(button => {
				expect(button).not.toHaveClass('disabled');
			});
		});
	});
});
