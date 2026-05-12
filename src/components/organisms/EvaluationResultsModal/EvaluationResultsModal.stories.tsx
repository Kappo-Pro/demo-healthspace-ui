/**
 * EvaluationResultsModal Storybook Stories
 *
 * Visual documentation and testing for the modal component
 * across different viewport sizes and states.
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { EvaluationResultsModal } from './EvaluationResultsModal';
import { TDataProps } from '@types';

// Mock evaluation data for stories
const mockEvaluationData: TDataProps = {
	id: 'eval-123',
	createdAt: new Date('2025-10-30'),
	updatedAt: new Date('2025-10-30'),
	active: true,
	userId: 'user-456',
	healthSigns: {
		id: 'hs-1',
		data: [
			{
				id: 'sign-1',
				name: 'Blood Pressure',
				value: '120/80',
				unit: 'mmHg',
				recordedAt: new Date('2025-10-30'),
			},
			{
				id: 'sign-2',
				name: 'Heart Rate',
				value: '72',
				unit: 'bpm',
				recordedAt: new Date('2025-10-30'),
			},
		],
	},
	medicalHistories: {
		id: 'mh-1',
		data: [
			{
				id: 'history-1',
				condition: 'Lower back pain',
				onset: new Date('2025-09-01'),
				severity: 'moderate',
				notes: 'Patient reports pain when sitting for extended periods',
			},
		],
	},
	painAssessments: [
		{
			id: 'pain-1',
			location: 'Lower Back',
			intensity: 6,
			type: 'Dull ache',
			frequency: 'Constant',
			createdAt: new Date('2025-10-30'),
		},
	],
};

const meta: Meta<typeof EvaluationResultsModal> = {
	title: 'Organisms/EvaluationResultsModal',
	component: EvaluationResultsModal,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Modal component for displaying virtual evaluation results. ' +
					'Provides a focused view with keyboard shortcuts, responsive sizing, ' +
					'and full accessibility support.',
			},
		},
	},
	tags: ['autodocs'],
	args: {
		isOpen: true,
		evaluationData: mockEvaluationData,
	},
	argTypes: {
		isOpen: {
			control: 'boolean',
			description: 'Controls modal visibility',
		},
		onClose: {
			action: 'closed',
			description: 'Callback when modal is closed',
		},
		evaluationData: {
			control: 'object',
			description: 'Evaluation data to display',
		},
		onStatusChange: {
			action: 'status-changed',
			description: 'Callback when status changes (optional)',
		},
		onExport: {
			action: 'exported',
			description: 'Callback when export is clicked (optional)',
		},
	},
};

export default meta;
type Story = StoryObj<typeof EvaluationResultsModal>;

/**
 * Default state - Modal open with standard mock data
 */
export const Default: Story = {
	args: {
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Default modal state with complete evaluation data. The modal opens with the Summary tab active, showing key findings and quick actions. Try pressing ESC to close or clicking the backdrop. Keyboard navigable with Tab and Arrow keys.',
			},
		},
		a11y: {
			config: {
				rules: [
					{
						id: 'color-contrast',
						enabled: true,
					},
					{
						id: 'focus-order-semantics',
						enabled: true,
					},
				],
			},
		},
	},
};

/**
 * Mobile viewport (375px) - Full-screen modal
 */
export const MobileView: Story = {
	args: {
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
		docs: {
			description: {
				story:
					'Mobile view shows full-screen modal (100vw x 100vh) with no border radius. ' +
					'Optimized for small screens with maximum content visibility.',
			},
		},
	},
};

/**
 * Tablet viewport (768px) - Centered modal with 90vw width
 */
export const TabletView: Story = {
	args: {
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		viewport: {
			defaultViewport: 'tablet',
		},
		docs: {
			description: {
				story:
					'Tablet view shows centered modal with 90vw max-width and 85vh max-height. ' +
					'Includes border-radius and shadow for depth.',
			},
		},
	},
};

/**
 * Desktop viewport (1280px) - Centered modal with 1200px max-width
 */
export const DesktopView: Story = {
	args: {
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		viewport: {
			defaultViewport: 'desktop',
		},
		docs: {
			description: {
				story:
					'Desktop view shows centered modal with 1200px max-width for optimal reading experience. ' +
					'Full design system styling with shadows and borders.',
			},
		},
	},
};

/**
 * Recent evaluation (today's date)
 */
export const RecentEvaluation: Story = {
	args: {
		evaluationData: {
			...mockEvaluationData,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Modal showing a recent evaluation from today.',
			},
		},
	},
};

/**
 * Historical evaluation (older date)
 */
export const HistoricalEvaluation: Story = {
	args: {
		evaluationData: {
			...mockEvaluationData,
			createdAt: new Date('2024-06-15'),
			updatedAt: new Date('2024-06-15'),
		},
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Modal showing a historical evaluation from several months ago.',
			},
		},
	},
};

/**
 * With all callbacks provided
 */
export const WithCallbacks: Story = {
	args: {
		onClose: () => {
			/* Modal closed */
		},
		onStatusChange: () => {
			/* Status changed */
		},
		onExport: () => {
			/* Export requested */
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Modal with all optional callbacks provided. Check the Actions panel ' +
					'to see callback invocations.',
			},
		},
	},
};

/**
 * Tab Navigation Demo (Story 1.2)
 */
export const TabNavigation: Story = {
	args: {
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Modal with 3-tab navigation: Summary, Pain Assessment, and Symptoms & History. ' +
					'Click tabs to switch between sections. Supports keyboard navigation (Arrow keys, Enter, Tab). ' +
					'Each tab shows placeholder content that will be populated in Stories 2.1, 2.2, and 2.3.',
			},
		},
	},
};

/**
 * Closed state (for testing)
 */
export const Closed: Story = {
	args: {
		isOpen: false,
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Modal in closed state - should not render. Use this story to test that the modal properly unmounts when closed.',
			},
		},
	},
};

/**
 * With Long Content (Test Scrolling)
 */
export const WithLongContent: Story = {
	args: {
		evaluationData: {
			...mockEvaluationData,
			painAssessments: Array.from({ length: 10 }, (_, i) => ({
				id: `pain-${i}`,
				location: `Body Part ${i}`,
				intensity: Math.floor(Math.random() * 10),
				type: ['Sharp', 'Dull', 'Burning'][i % 3],
				frequency: 'Constant',
				createdAt: new Date('2025-10-30'),
			})),
		},
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Modal with extensive pain assessment data (10 pain locations). Tests scrolling behavior and content overflow handling. The modal body should scroll smoothly without layout shift.',
			},
		},
	},
};

/**
 * Missing Data (Empty States)
 */
export const MissingData: Story = {
	args: {
		evaluationData: {
			id: 'eval-empty',
			createdAt: new Date('2025-10-30'),
			updatedAt: new Date('2025-10-30'),
			active: true,
			userId: 'user-123',
			painAssessments: [],
			healthSigns: { strapiHealthSigns: [] },
			medicalHistories: { strapiMedicalHistories: [] },
		},
		onClose: () => {
			/* Modal closed */
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Modal with missing or incomplete data fields. Tests fallback rendering and empty state messages. All tabs should show appropriate "No data available" messages.',
			},
		},
	},
};

/**
 * Loading State (With Export)
 */
export const LoadingExport: Story = {
	args: {
		onClose: () => {
			/* Modal closed */
		},
		onExport: () => {
			/* Export triggered - In real app, this would trigger PDF generation */
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Modal with export button. Click "Export PDF" in the Summary tab to see the action logged in the Actions panel below. Tests the export callback flow.',
			},
		},
	},
};
