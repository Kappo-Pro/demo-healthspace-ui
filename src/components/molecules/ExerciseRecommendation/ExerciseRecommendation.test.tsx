import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ExerciseRecommendation } from './ExerciseRecommendation';
import type { ExerciseLibrary } from '@types';

// Mock Redux store
const createMockStore = (initialState = {}) => {
	return configureStore({
		reducer: {
			postures: {
				postures: () => initialState,
			},
			user: {
				user: () => ({ id: 'user-123' }),
			},
		},
	});
};

// Mock exercise data
const mockExercises: ExerciseLibrary[] = [
	{
		id: 1,
		title: 'Neck Stretch',
		description: 'Gentle neck stretching exercises',
		duration: 300,
		difficulty: 'beginner',
		muscleGroups: ['Neck/Shoulders'],
		videoUrl: '/videos/neck-stretch.mp4',
		thumbnailUrl: '/thumbnails/neck-stretch.jpg',
		instructions: [
			{ step: 1, instruction: 'Stand straight' },
			{ step: 2, instruction: 'Tilt head left' },
		],
		safetyTips: 'Move slowly',
		contraindications: 'Avoid if neck pain',
		captionsUrl: '/captions/neck-stretch.vtt',
		postureRecommendation: true,
	},
	{
		id: 2,
		title: 'Back Extension',
		description: 'Strengthen upper back muscles',
		duration: 600,
		difficulty: 'intermediate',
		muscleGroups: ['Upper Back'],
		videoUrl: '/videos/back-extension.mp4',
		thumbnailUrl: '/thumbnails/back-extension.jpg',
		instructions: [
			{ step: 1, instruction: 'Lie on stomach' },
			{ step: 2, instruction: 'Lift chest up' },
		],
		safetyTips: 'Keep core engaged',
		contraindications: 'Avoid if lower back injury',
		postureRecommendation: true,
	},
	{
		id: 3,
		title: 'Core Plank',
		description: 'Advanced core strengthening',
		duration: 180,
		difficulty: 'advanced',
		muscleGroups: ['Core'],
		videoUrl: '/videos/core-plank.mp4',
		thumbnailUrl: '/thumbnails/core-plank.jpg',
		instructions: [
			{ step: 1, instruction: 'Start in push-up position' },
			{ step: 2, instruction: 'Hold position' },
		],
		safetyTips: 'Maintain straight line',
		contraindications: 'Avoid if wrist pain',
		postureRecommendation: true,
	},
];

describe('ExerciseRecommendation', () => {
	const defaultState = {
		exerciseRecommendations: mockExercises,
		exerciseRecommendationsLoading: false,
		exerciseTracking: {
			userId: 'user-123',
			exercises: {
				'1': {
					completions: [{ date: '2025-10-20', duration: 300 }],
					currentStreak: 3,
					longestStreak: 5,
					lastCompleted: '2025-10-20',
				},
			},
		},
		exerciseTrackingLoading: false,
	};

	const renderWithStore = (state = defaultState) => {
		const store = createMockStore(state);
		return render(
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>,
		);
	};

	describe('Rendering', () => {
		it('should render exercise recommendation grid', () => {
			renderWithStore();
			expect(screen.getByText('Recommended Exercises')).toBeInTheDocument();
			expect(screen.getByText('Neck Stretch')).toBeInTheDocument();
			expect(screen.getByText('Back Extension')).toBeInTheDocument();
			expect(screen.getByText('Core Plank')).toBeInTheDocument();
		});

		it('should display correct number of exercises in header', () => {
			renderWithStore();
			expect(
				screen.getByText('3 exercises to improve your posture'),
			).toBeInTheDocument();
		});

		it('should show loading state', () => {
			const loadingState = {
				...defaultState,
				exerciseRecommendationsLoading: true,
			};
			renderWithStore(loadingState);
			expect(
				screen.getByText('Loading exercise recommendations...'),
			).toBeInTheDocument();
		});

		it('should show empty state when no exercises', () => {
			const emptyState = {
				...defaultState,
				exerciseRecommendations: [],
			};
			renderWithStore(emptyState);
			expect(
				screen.getByText('No exercise recommendations available'),
			).toBeInTheDocument();
		});
	});

	describe('Filtering', () => {
		it('should filter exercises by muscle group', async () => {
			renderWithStore();

			// Click muscle group filter
			const muscleGroupFilter = screen.getByLabelText('Filter by muscle group');
			fireEvent.mouseDown(muscleGroupFilter);

			// Select "Neck/Shoulders"
			await waitFor(() => {
				const option = screen.getByText('Neck/Shoulders');
				fireEvent.click(option);
			});

			// Only Neck Stretch should be visible
			expect(screen.getByText('Neck Stretch')).toBeInTheDocument();
			expect(screen.queryByText('Back Extension')).not.toBeInTheDocument();
			expect(screen.queryByText('Core Plank')).not.toBeInTheDocument();
		});

		it('should filter exercises by difficulty', async () => {
			renderWithStore();

			// Click difficulty filter
			const difficultyFilter = screen.getByLabelText('Filter by difficulty');
			fireEvent.mouseDown(difficultyFilter);

			// Select "beginner"
			await waitFor(() => {
				const option = screen.getByText('Beginner');
				fireEvent.click(option);
			});

			// Only Neck Stretch should be visible
			expect(screen.getByText('Neck Stretch')).toBeInTheDocument();
			expect(screen.queryByText('Back Extension')).not.toBeInTheDocument();
		});

		it('should show empty state when no exercises match filters', async () => {
			const singleExerciseState = {
				...defaultState,
				exerciseRecommendations: [mockExercises[0]], // Only neck stretch
			};
			renderWithStore(singleExerciseState);

			// Filter by Core muscle group (no exercises match)
			const muscleGroupFilter = screen.getByLabelText('Filter by muscle group');
			fireEvent.mouseDown(muscleGroupFilter);

			await waitFor(() => {
				const option = screen.getByText('Core');
				fireEvent.click(option);
			});

			expect(
				screen.getByText('No exercises match your filters'),
			).toBeInTheDocument();
		});
	});

	describe('Sorting', () => {
		it('should sort exercises alphabetically', async () => {
			renderWithStore();

			// Click sort dropdown
			const sortDropdown = screen.getByLabelText('Sort exercises');
			fireEvent.mouseDown(sortDropdown);

			// Select A-Z
			await waitFor(() => {
				const option = screen.getByText('A-Z');
				fireEvent.click(option);
			});

			// Verify order: Back Extension, Core Plank, Neck Stretch
			const exercises = screen.getAllByRole('article');
			expect(exercises[0]).toHaveTextContent('Back Extension');
			expect(exercises[1]).toHaveTextContent('Core Plank');
			expect(exercises[2]).toHaveTextContent('Neck Stretch');
		});

		it('should sort exercises by duration', async () => {
			renderWithStore();

			const sortDropdown = screen.getByLabelText('Sort exercises');
			fireEvent.mouseDown(sortDropdown);

			await waitFor(() => {
				const option = screen.getByText('Duration');
				fireEvent.click(option);
			});

			// Verify order: Core Plank (180s), Neck Stretch (300s), Back Extension (600s)
			const exercises = screen.getAllByRole('article');
			expect(exercises[0]).toHaveTextContent('Core Plank');
			expect(exercises[1]).toHaveTextContent('Neck Stretch');
			expect(exercises[2]).toHaveTextContent('Back Extension');
		});

		it('should sort exercises by difficulty', async () => {
			renderWithStore();

			const sortDropdown = screen.getByLabelText('Sort exercises');
			fireEvent.mouseDown(sortDropdown);

			await waitFor(() => {
				const option = screen.getByText('Difficulty');
				fireEvent.click(option);
			});

			// Verify order: beginner, intermediate, advanced
			const exercises = screen.getAllByRole('article');
			expect(exercises[0]).toHaveTextContent('Neck Stretch');
			expect(exercises[1]).toHaveTextContent('Back Extension');
			expect(exercises[2]).toHaveTextContent('Core Plank');
		});
	});

	describe('Exercise Interactions', () => {
		it('should open detail modal when exercise card clicked', async () => {
			renderWithStore();

			// Click on first exercise
			const exerciseCard = screen.getByText('Neck Stretch');
			fireEvent.click(exerciseCard);

			// Modal should open
			await waitFor(() => {
				expect(screen.getByRole('dialog')).toBeInTheDocument();
			});
		});

		it('should display video player in modal', async () => {
			renderWithStore();

			const exerciseCard = screen.getByText('Neck Stretch');
			fireEvent.click(exerciseCard);

			await waitFor(() => {
				expect(
					screen.getByLabelText('Exercise demonstration video'),
				).toBeInTheDocument();
			});
		});

		it('should display instruction panel in modal', async () => {
			renderWithStore();

			const exerciseCard = screen.getByText('Neck Stretch');
			fireEvent.click(exerciseCard);

			await waitFor(() => {
				// Switch to instructions tab
				const instructionsTab = screen.getByText('Instructions');
				fireEvent.click(instructionsTab);
			});

			expect(screen.getByText('Stand straight')).toBeInTheDocument();
		});

		it('should close modal when cancel clicked', async () => {
			renderWithStore();

			const exerciseCard = screen.getByText('Neck Stretch');
			fireEvent.click(exerciseCard);

			await waitFor(() => {
				expect(screen.getByRole('dialog')).toBeInTheDocument();
			});

			// Close modal
			const closeButton = screen.getByRole('button', { name: /close/i });
			fireEvent.click(closeButton);

			await waitFor(() => {
				expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			});
		});
	});

	describe('Adherence Tracking', () => {
		it('should display streak counter for completed exercises', () => {
			renderWithStore();

			// Neck Stretch has a 3-day streak
			expect(screen.getByText('3 days!')).toBeInTheDocument();
		});

		it('should not display streak for exercises without completions', () => {
			renderWithStore();

			// Back Extension and Core Plank have no streaks
			const streakElements = screen.getAllByText(/days!/);
			expect(streakElements).toHaveLength(1); // Only Neck Stretch
		});

		it('should handle completion toggle', () => {
			renderWithStore();

			// Find and click "Mark complete" checkbox for Back Extension
			const checkboxes = screen.getAllByRole('checkbox');
			fireEvent.click(checkboxes[1]); // Second exercise (Back Extension)

			// Verify checkbox state changed (checked by testing library)
			expect(checkboxes[1]).toBeChecked();
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA labels on filters', () => {
			renderWithStore();

			expect(
				screen.getByLabelText('Filter by muscle group'),
			).toBeInTheDocument();
			expect(screen.getByLabelText('Filter by difficulty')).toBeInTheDocument();
			expect(screen.getByLabelText('Sort exercises')).toBeInTheDocument();
		});

		it('should have proper ARIA labels on exercise cards', () => {
			renderWithStore();

			expect(
				screen.getByLabelText('Exercise: Neck Stretch'),
			).toBeInTheDocument();
			expect(
				screen.getByLabelText('Exercise: Back Extension'),
			).toBeInTheDocument();
		});

		it('should announce exercise details to screen readers', () => {
			renderWithStore();

			const cards = screen.getAllByRole('article');
			expect(cards[0]).toHaveAttribute('aria-label', 'Exercise: Neck Stretch');
		});
	});

	describe('Responsive Behavior', () => {
		it('should display grid with responsive columns', () => {
			renderWithStore();

			const grid = screen
				.getByText('Neck Stretch')
				.closest('.exercise-grid') as HTMLElement;
			expect(grid).toHaveStyle({
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
			});
		});
	});

	describe('Props', () => {
		it('should respect maxExercises prop', () => {
			const store = createMockStore(defaultState);
			render(
				<Provider store={store}>
					<ExerciseRecommendation sessionId="session-123" maxExercises={2} />
				</Provider>,
			);

			// Should only display 2 exercises
			const cards = screen.getAllByRole('article');
			expect(cards).toHaveLength(2);
		});

		it('should hide filters when showFilters is false', () => {
			const store = createMockStore(defaultState);
			render(
				<Provider store={store}>
					<ExerciseRecommendation sessionId="session-123" showFilters={false} />
				</Provider>,
			);

			expect(
				screen.queryByLabelText('Filter by muscle group'),
			).not.toBeInTheDocument();
		});

		it('should hide sorting when showSorting is false', () => {
			const store = createMockStore(defaultState);
			render(
				<Provider store={store}>
					<ExerciseRecommendation sessionId="session-123" showSorting={false} />
				</Provider>,
			);

			expect(screen.queryByLabelText('Sort exercises')).not.toBeInTheDocument();
		});
	});
});
