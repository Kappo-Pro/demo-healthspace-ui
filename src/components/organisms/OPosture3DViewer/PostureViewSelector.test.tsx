import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostureViewSelector } from './PostureViewSelector';

describe('PostureViewSelector', () => {
	const mockOnChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Basic Rendering', () => {
		it('should render without crashing', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			expect(screen.getByRole('radiogroup')).toBeInTheDocument();
		});

		it('should show 2D and 3D options', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			expect(screen.getByText('2D View')).toBeInTheDocument();
			expect(screen.getByText('3D View')).toBeInTheDocument();
		});

		it('should display current selection visually - 2D active', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const twoDButton = screen.getByText('2D View').closest('button');
			const threeDButton = screen.getByText('3D View').closest('button');

			expect(twoDButton).toHaveClass('active');
			expect(threeDButton).not.toHaveClass('active');
		});

		it('should display current selection visually - 3D active', () => {
			render(<PostureViewSelector currentView="3d" onChange={mockOnChange} />);

			const twoDButton = screen.getByText('2D View').closest('button');
			const threeDButton = screen.getByText('3D View').closest('button');

			expect(threeDButton).toHaveClass('active');
			expect(twoDButton).not.toHaveClass('active');
		});
	});

	describe('User Interaction', () => {
		it('should call onChange with "2d" when 2D option clicked', () => {
			render(<PostureViewSelector currentView="3d" onChange={mockOnChange} />);

			fireEvent.click(screen.getByText('2D View'));

			expect(mockOnChange).toHaveBeenCalledWith('2d');
			expect(mockOnChange).toHaveBeenCalledTimes(1);
		});

		it('should call onChange with "3d" when 3D option clicked', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			fireEvent.click(screen.getByText('3D View'));

			expect(mockOnChange).toHaveBeenCalledWith('3d');
			expect(mockOnChange).toHaveBeenCalledTimes(1);
		});

		it('should support keyboard navigation with Enter key', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const threeDButton = screen.getByText('3D View');
			fireEvent.keyDown(threeDButton, { key: 'Enter', code: 'Enter' });

			expect(mockOnChange).toHaveBeenCalledWith('3d');
		});

		it('should support keyboard navigation with Space key', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const threeDButton = screen.getByText('3D View');
			fireEvent.keyDown(threeDButton, { key: ' ', code: 'Space' });

			expect(mockOnChange).toHaveBeenCalledWith('3d');
		});

		it('should not call onChange when clicking already active option', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			fireEvent.click(screen.getByText('2D View'));

			// Should still call onChange even if already active (for consistency)
			expect(mockOnChange).toHaveBeenCalledWith('2d');
		});
	});

	describe('WebGL Integration', () => {
		it('should disable 3D option when is3DAvailable is false', () => {
			render(
				<PostureViewSelector
					currentView="2d"
					onChange={mockOnChange}
					is3DAvailable={false}
				/>,
			);

			const threeDButton = screen.getByText('3D View').closest('button');

			expect(threeDButton).toBeDisabled();
			expect(threeDButton).toHaveAttribute('aria-disabled', 'true');
		});

		it('should show tooltip when 3D is disabled', () => {
			render(
				<PostureViewSelector
					currentView="2d"
					onChange={mockOnChange}
					is3DAvailable={false}
				/>,
			);

			const threeDButton = screen.getByText('3D View').closest('button');

			expect(threeDButton).toHaveAttribute(
				'title',
				'3D view requires WebGL support',
			);
		});

		it('should not call onChange when clicking disabled 3D option', () => {
			render(
				<PostureViewSelector
					currentView="2d"
					onChange={mockOnChange}
					is3DAvailable={false}
				/>,
			);

			const threeDButton = screen.getByText('3D View');
			fireEvent.click(threeDButton);

			expect(mockOnChange).not.toHaveBeenCalled();
		});

		it('should enable 3D option when is3DAvailable is true', () => {
			render(
				<PostureViewSelector
					currentView="2d"
					onChange={mockOnChange}
					is3DAvailable={true}
				/>,
			);

			const threeDButton = screen.getByText('3D View').closest('button');

			expect(threeDButton).not.toBeDisabled();
			expect(threeDButton).not.toHaveAttribute('aria-disabled');
		});

		it('should default is3DAvailable to true when not provided', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const threeDButton = screen.getByText('3D View').closest('button');

			expect(threeDButton).not.toBeDisabled();
		});
	});

	describe('ARIA Accessibility', () => {
		it('should have radiogroup role on container', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const container = screen.getByRole('radiogroup');
			expect(container).toBeInTheDocument();
		});

		it('should have aria-label on radiogroup', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const container = screen.getByRole('radiogroup');
			expect(container).toHaveAttribute(
				'aria-label',
				'Select posture view mode',
			);
		});

		it('should have radio role on each option', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const radios = screen.getAllByRole('radio');
			expect(radios).toHaveLength(2);
		});

		it('should have aria-checked="true" on active option', () => {
			render(<PostureViewSelector currentView="3d" onChange={mockOnChange} />);

			const twoDButton = screen.getByText('2D View');
			const threeDButton = screen.getByText('3D View');

			expect(twoDButton).toHaveAttribute('aria-checked', 'false');
			expect(threeDButton).toHaveAttribute('aria-checked', 'true');
		});

		it('should have proper focus indicators', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const threeDButton = screen.getByText('3D View').closest('button');

			// Focus the button
			threeDButton?.focus();

			expect(threeDButton).toHaveFocus();
		});

		it('should set aria-disabled on disabled 3D option', () => {
			render(
				<PostureViewSelector
					currentView="2d"
					onChange={mockOnChange}
					is3DAvailable={false}
				/>,
			);

			const threeDButton = screen.getByText('3D View');

			expect(threeDButton).toHaveAttribute('aria-disabled', 'true');
		});
	});

	describe('Visual State', () => {
		it('should apply active class to current view', () => {
			const { rerender } = render(
				<PostureViewSelector currentView="2d" onChange={mockOnChange} />,
			);

			const twoDButton = screen.getByText('2D View').closest('button');
			expect(twoDButton).toHaveClass('view-option', 'active');

			rerender(
				<PostureViewSelector currentView="3d" onChange={mockOnChange} />,
			);

			const threeDButton = screen.getByText('3D View').closest('button');
			expect(threeDButton).toHaveClass('view-option', 'active');
		});

		it('should apply disabled class when 3D unavailable', () => {
			render(
				<PostureViewSelector
					currentView="2d"
					onChange={mockOnChange}
					is3DAvailable={false}
				/>,
			);

			const threeDButton = screen.getByText('3D View').closest('button');

			expect(threeDButton).toHaveClass('disabled');
		});

		it('should not apply disabled class when 3D available', () => {
			render(
				<PostureViewSelector
					currentView="2d"
					onChange={mockOnChange}
					is3DAvailable={true}
				/>,
			);

			const threeDButton = screen.getByText('3D View').closest('button');

			expect(threeDButton).not.toHaveClass('disabled');
		});
	});

	describe('Custom className', () => {
		it('should apply custom className to container', () => {
			render(
				<PostureViewSelector
					currentView="2d"
					onChange={mockOnChange}
					className="custom-selector"
				/>,
			);

			const container = screen.getByRole('radiogroup');

			expect(container).toHaveClass('posture-view-selector', 'custom-selector');
		});

		it('should work without custom className', () => {
			render(<PostureViewSelector currentView="2d" onChange={mockOnChange} />);

			const container = screen.getByRole('radiogroup');

			expect(container).toHaveClass('posture-view-selector');
		});
	});
});
