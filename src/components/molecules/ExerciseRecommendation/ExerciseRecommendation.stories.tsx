import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ExerciseRecommendation } from './ExerciseRecommendation';
import type { ExerciseLibrary } from '@types';

// Mock exercise data
const mockExercises: ExerciseLibrary[] = [
	{
		id: 1,
		title: 'Neck Stretch',
		description: 'Gentle neck stretching exercises to improve head alignment',
		duration: 300,
		difficulty: 'beginner',
		muscleGroups: ['Neck/Shoulders'],
		videoUrl: '/videos/neck-stretch.mp4',
		thumbnailUrl:
			'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Neck+Stretch',
		instructions: [
			{ step: 1, instruction: 'Stand with your feet shoulder-width apart' },
			{ step: 2, instruction: 'Slowly tilt your head to the left' },
			{ step: 3, instruction: 'Hold for 15-20 seconds' },
			{ step: 4, instruction: 'Return to center and repeat on the right side' },
		],
		safetyTips: 'Move slowly and gently. Stop if you feel sharp pain.',
		contraindications: 'Avoid if you have acute neck injury or whiplash',
		captionsUrl: '/captions/neck-stretch.vtt',
		postureRecommendation: true,
	},
	{
		id: 2,
		title: 'Back Extension',
		description: 'Strengthen upper back muscles for better posture',
		duration: 600,
		difficulty: 'intermediate',
		muscleGroups: ['Upper Back'],
		videoUrl: '/videos/back-extension.mp4',
		thumbnailUrl:
			'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Back+Extension',
		instructions: [
			{ step: 1, instruction: 'Lie face down on an exercise mat' },
			{ step: 2, instruction: 'Place your hands beside your shoulders' },
			{ step: 3, instruction: 'Slowly lift your chest off the ground' },
			{ step: 4, instruction: 'Hold for 5-10 seconds, then lower' },
		],
		safetyTips: 'Keep your core engaged. Avoid over-arching your back.',
		contraindications: 'Avoid if you have lower back injury or disc problems',
		postureRecommendation: true,
	},
	{
		id: 3,
		title: 'Core Plank',
		description: 'Advanced core strengthening exercise',
		duration: 180,
		difficulty: 'advanced',
		muscleGroups: ['Core'],
		videoUrl: '/videos/core-plank.mp4',
		thumbnailUrl:
			'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Core+Plank',
		instructions: [
			{ step: 1, instruction: 'Start in a push-up position' },
			{ step: 2, instruction: 'Lower onto your forearms' },
			{ step: 3, instruction: 'Keep your body in a straight line' },
			{ step: 4, instruction: 'Hold for 30-60 seconds' },
		],
		safetyTips:
			'Maintain a straight line from head to heels. Breathe steadily.',
		contraindications: 'Avoid if you have wrist pain or shoulder injury',
		captionsUrl: '/captions/core-plank.vtt',
		postureRecommendation: true,
	},
	{
		id: 4,
		title: 'Lower Back Stretch',
		description: 'Gentle stretch for lower back relief',
		duration: 240,
		difficulty: 'beginner',
		muscleGroups: ['Lower Back'],
		videoUrl: '/videos/lower-back-stretch.mp4',
		thumbnailUrl:
			'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Lower+Back',
		instructions: [
			{ step: 1, instruction: 'Lie on your back with knees bent' },
			{ step: 2, instruction: 'Bring both knees to your chest' },
			{ step: 3, instruction: 'Hold for 20-30 seconds' },
		],
		safetyTips: 'Keep your shoulders on the floor.',
		contraindications: 'Avoid if you have herniated disc',
		postureRecommendation: true,
	},
	{
		id: 5,
		title: 'Hip Flexor Stretch',
		description: 'Improve hip mobility and posture',
		duration: 360,
		difficulty: 'intermediate',
		muscleGroups: ['Hips/Pelvis'],
		videoUrl: '/videos/hip-flexor.mp4',
		thumbnailUrl:
			'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Hip+Flexor',
		instructions: [
			{ step: 1, instruction: 'Kneel on one knee' },
			{ step: 2, instruction: 'Lean forward until you feel a stretch' },
			{ step: 3, instruction: 'Hold for 20-30 seconds' },
			{ step: 4, instruction: 'Switch sides and repeat' },
		],
		safetyTips: 'Keep your back straight during the stretch.',
		contraindications: 'Avoid if you have hip replacement',
		postureRecommendation: true,
	},
];

// Create mock store
const createMockStore = (
	exerciseRecommendations: ExerciseLibrary[],
	loading = false,
	exerciseTracking = null,
) => {
	return configureStore({
		reducer: {
			postures: {
				postures: () => ({
					exerciseRecommendations,
					exerciseRecommendationsLoading: loading,
					exerciseTracking,
					exerciseTrackingLoading: false,
				}),
			},
			user: {
				user: () => ({ id: 'user-123' }),
			},
		},
	});
};

const meta: Meta<typeof ExerciseRecommendation> = {
	title: 'Molecules/ExerciseRecommendation',
	component: ExerciseRecommendation,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
Exercise Recommendation component displays a grid of recommended exercises with filtering, sorting, and detail modal (Story 2.3).

**Features:**
- 3-5 exercises per scan
- Filtering by muscle group and difficulty
- Sorting by priority, alphabetical, duration, difficulty
- Video player with custom controls
- Step-by-step instructions
- Adherence tracking with streaks
- WCAG 2.1 AA compliant
        `,
			},
		},
	},
	decorators: [
		Story => (
			<div
				style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--surface-subtle)' }}>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof ExerciseRecommendation>;

/**
 * Default state with 5 recommended exercises
 */
export const Default: Story = {
	render: () => {
		const store = createMockStore(mockExercises);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Default view with 5 exercises, all filters and sorting enabled.',
			},
		},
	},
};

/**
 * Loading state while fetching recommendations
 */
export const Loading: Story = {
	render: () => {
		const store = createMockStore([], true);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Loading spinner shown while fetching exercise recommendations from API.',
			},
		},
	},
};

/**
 * Empty state when no recommendations available
 */
export const Empty: Story = {
	render: () => {
		const store = createMockStore([]);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Empty state displayed when no exercise recommendations are available for the session.',
			},
		},
	},
};

/**
 * With adherence tracking and streaks
 */
export const WithStreaks: Story = {
	render: () => {
		const trackingData = {
			userId: 'user-123',
			exercises: {
				'1': {
					completions: [
						{ date: '2025-10-20', duration: 300 },
						{ date: '2025-10-21', duration: 300 },
						{ date: '2025-10-22', duration: 300 },
					],
					currentStreak: 3,
					longestStreak: 5,
					lastCompleted: '2025-10-22',
				},
				'3': {
					completions: [{ date: '2025-10-22', duration: 180 }],
					currentStreak: 7,
					longestStreak: 7,
					lastCompleted: '2025-10-22',
				},
			},
		};
		const store = createMockStore(mockExercises, false, trackingData);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Shows streak counters for exercises that have been completed consistently (FR28).',
			},
		},
	},
};

/**
 * Limited to 3 exercises
 */
export const MaxThreeExercises: Story = {
	render: () => {
		const store = createMockStore(mockExercises);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" maxExercises={3} />
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Limits display to maximum 3 exercises using the maxExercises prop.',
			},
		},
	},
};

/**
 * Without filters (simplified UI)
 */
export const WithoutFilters: Story = {
	render: () => {
		const store = createMockStore(mockExercises);
		return (
			<Provider store={store}>
				<ExerciseRecommendation
					sessionId="session-123"
					showFilters={false}
					showSorting={false}
				/>
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Simplified view without filtering and sorting controls for embedded use.',
			},
		},
	},
};

/**
 * Only beginner exercises
 */
export const BeginnerOnly: Story = {
	render: () => {
		const beginnerExercises = mockExercises.filter(
			ex => ex.difficulty === 'beginner',
		);
		const store = createMockStore(beginnerExercises);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Shows only beginner-level exercises suitable for patients new to therapy.',
			},
		},
	},
};

/**
 * Advanced exercises only
 */
export const AdvancedOnly: Story = {
	render: () => {
		const advancedExercises = mockExercises.filter(
			ex => ex.difficulty === 'advanced',
		);
		const store = createMockStore(advancedExercises);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows only advanced exercises for experienced patients.',
			},
		},
	},
};

/**
 * Single muscle group (Neck/Shoulders)
 */
export const NeckShouldersFocus: Story = {
	render: () => {
		const neckExercises = mockExercises.filter(ex =>
			ex.muscleGroups.includes('Neck/Shoulders'),
		);
		const store = createMockStore(neckExercises);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Focuses on neck and shoulder exercises for forward head posture correction.',
			},
		},
	},
};

/**
 * Responsive - Mobile view
 */
export const MobileView: Story = {
	render: () => {
		const store = createMockStore(mockExercises.slice(0, 3));
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		viewport: {
			defaultViewport: 'iphone12',
		},
		docs: {
			description: {
				story: 'Mobile-optimized view with stacked exercise cards.',
			},
		},
	},
};

/**
 * Responsive - Tablet view
 */
export const TabletView: Story = {
	render: () => {
		const store = createMockStore(mockExercises);
		return (
			<Provider store={store}>
				<ExerciseRecommendation sessionId="session-123" />
			</Provider>
		);
	},
	parameters: {
		viewport: {
			defaultViewport: 'ipad',
		},
		docs: {
			description: {
				story: 'Tablet view with 2-column grid layout.',
			},
		},
	},
};
