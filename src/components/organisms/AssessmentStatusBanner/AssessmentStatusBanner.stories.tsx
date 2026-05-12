import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AssessmentStatusBanner } from './AssessmentStatusBanner';
import dashboardReducer from '@stores/dashboard/dashboardSlice';
import type { AssessmentStatus } from '@stores/dashboard/types';

/**
 * EPIC-003-S3: Redux Connection Verification
 *
 * This story demonstrates the AssessmentStatusBanner connected to Redux:
 * - Component reads from Redux state (no props needed)
 * - Dispatches fetchDashboardData on mount
 * - Handles empty state gracefully
 *
 * Responsive behavior (from EPIC-002-S5):
 * - Mobile (<576px): Cards stack vertically (1 column)
 * - Tablet (576px-768px): Cards display in 2 columns
 * - Desktop (≥768px): Cards display in 3 columns
 */

// Helper to create mock store with dashboard data
const createMockStore = (assessmentStatuses: {
	rom: AssessmentStatus | null;
	posture: AssessmentStatus | null;
	survey: AssessmentStatus | null;
}) => {
	return configureStore({
		reducer: {
			dashboard: dashboardReducer,
		},
		preloadedState: {
			dashboard: {
				assessmentStatuses,
				metrics: {
					romScore: null,
					sessionsCompleted: 0,
					streak: 0,
				},
				loading: false,
				error: null,
			},
		},
	});
};

// Mock assessment data
const mockROM: AssessmentStatus = {
	type: 'rom',
	status: 'completed',
	score: 85,
	lastUpdated: '2025-10-15T10:30:00Z',
};

const mockPosture: AssessmentStatus = {
	type: 'posture',
	status: 'pending',
	lastUpdated: '2025-10-14T09:00:00Z',
};

const mockSurvey: AssessmentStatus = {
	type: 'survey',
	status: 'expired',
	lastUpdated: '2025-10-10T15:00:00Z',
};

const meta: Meta<typeof AssessmentStatusBanner> = {
	title: 'Organisms/AssessmentStatusBanner',
	component: AssessmentStatusBanner,
	decorators: [
		Story => (
			<Provider
				store={createMockStore({
					rom: mockROM,
					posture: mockPosture,
					survey: mockSurvey,
				})}>
				<Story />
			</Provider>
		),
	],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Responsive grid container for assessment status cards. Now connected to Redux for live data. ' +
					'Dispatches fetchDashboardData on mount and reads state.dashboard.assessmentStatuses.',
			},
		},
		// Viewport presets for testing
		viewport: {
			viewports: {
				mobile: {
					name: 'Mobile (375px)',
					styles: { width: '375px', height: '667px' },
				},
				mobileLandscape: {
					name: 'Mobile Landscape (667px)',
					styles: { width: '667px', height: '375px' },
				},
				tablet: {
					name: 'Tablet (640px)',
					styles: { width: '640px', height: '800px' },
				},
				tabletBreakpoint: {
					name: 'Tablet Breakpoint (768px)',
					styles: { width: '768px', height: '1024px' },
				},
				desktop: {
					name: 'Desktop (1024px)',
					styles: { width: '1024px', height: '768px' },
				},
				desktopLarge: {
					name: 'Large Desktop (1920px)',
					styles: { width: '1920px', height: '1080px' },
				},
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AssessmentStatusBanner>;

/**
 * Default Story: Three Assessment Cards (Redux Connected)
 *
 * AC-001: Component reads from Redux state
 * AC-002: Dispatches fetchDashboardData on mount
 * AC-003: Displays ROM, Posture, Survey cards with live data
 * AC-004: Test at 375px - Cards should stack vertically
 * AC-005: Test at 640px - Cards should show 2 columns
 * AC-006: Test at 1024px - Cards should show 3 columns
 */
export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three assessment cards from Redux state. Component dispatches fetchDashboardData on mount. ' +
					'Use viewport toolbar to test mobile (375px), tablet (640px), and desktop (1024px) layouts.',
			},
		},
	},
};

/**
 * Mobile View (375px)
 * AC-001: Cards stack vertically on mobile (<576px)
 */
export const MobileView: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'mobile',
		},
		docs: {
			description: {
				story:
					'Mobile viewport (375px width). Cards should stack vertically with 16px spacing between them. ' +
					'No horizontal scroll should be present.',
			},
		},
	},
};

/**
 * Mobile Landscape (667x375)
 * AC-002: Should show 2 columns on landscape
 */
export const MobileLandscape: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'mobileLandscape',
		},
		docs: {
			description: {
				story:
					'Mobile landscape orientation (667px width). Should display 2 columns.',
			},
		},
	},
};

/**
 * Tablet View (640px)
 * AC-002: Cards display 2 columns on tablet (576px-768px)
 */
export const TabletView: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'tablet',
		},
		docs: {
			description: {
				story:
					'Tablet viewport (640px width). Cards should display in 2 columns with 16px gutter between them. ' +
					'Two cards per row, third card wraps to next row.',
			},
		},
	},
};

/**
 * Tablet Breakpoint (768px)
 * AC-003: Transition point to desktop layout
 */
export const TabletBreakpoint: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'tabletBreakpoint',
		},
		docs: {
			description: {
				story:
					'Tablet breakpoint (768px width). At this width, layout transitions to 3-column desktop grid. ' +
					'All three cards should fit in a single row.',
			},
		},
	},
};

/**
 * Desktop View (1024px)
 * AC-003: Cards display 3 columns on desktop (≥768px)
 */
export const DesktopView: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'desktop',
		},
		docs: {
			description: {
				story:
					'Desktop viewport (1024px width). Cards should display in 3 columns with 16px gutter between them. ' +
					'All three cards fit comfortably in a single row.',
			},
		},
	},
};

/**
 * Large Desktop (1920px)
 * AC-003: Maintains 3 columns on large screens
 */
export const LargeDesktop: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'desktopLarge',
		},
		docs: {
			description: {
				story:
					'Large desktop viewport (1920px width). Cards still display in 3 columns (not 4 or more). ' +
					'Cards are wider but maintain the same layout structure.',
			},
		},
	},
};

/**
 * Single Card
 * Edge case: Layout should work with minimal content
 */
export const SingleCard: Story = {
	decorators: [
		Story => (
			<Provider
				store={createMockStore({
					rom: mockROM,
					posture: null,
					survey: null,
				})}>
				<Story />
			</Provider>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					'Single assessment card (ROM only). Should display at full width on mobile, and partial width on desktop.',
			},
		},
	},
};

/**
 * Two Cards
 * Edge case: Layout behavior with 2 cards
 */
export const TwoCards: Story = {
	decorators: [
		Story => (
			<Provider
				store={createMockStore({
					rom: mockROM,
					posture: mockPosture,
					survey: null,
				})}>
				<Story />
			</Provider>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					'Two assessment cards (ROM and Posture). Mobile: stacked, Tablet: side-by-side (2 columns), Desktop: side-by-side with gap (2 of 3 columns).',
			},
		},
	},
};

/**
 * Many Cards (6 cards)
 * Edge case: Multiple rows
 *
 * Note: With Redux integration, we only have 3 assessment types (ROM, Posture, Survey).
 * This story now shows the maximum of 3 cards. For testing multi-row layouts,
 * resize the viewport to force wrapping.
 */
export const ManyCards: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'All three assessment cards (ROM, Posture, Survey). ' +
					'Mobile: 3 rows (1 column), Tablet: 2 rows (2 columns), Desktop: 1 row (3 columns). ' +
					'Note: With Redux integration, maximum is 3 cards (one per assessment type).',
			},
		},
	},
};

/**
 * No Cards
 * Edge case: Empty state
 */
export const NoCards: Story = {
	decorators: [
		Story => (
			<Provider
				store={createMockStore({
					rom: null,
					posture: null,
					survey: null,
				})}>
				<Story />
			</Provider>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					'Empty state with no assessment data in Redux. Component should render Ant Design Empty component. ' +
					'This demonstrates graceful handling when no assessments are available yet.',
			},
		},
	},
};
