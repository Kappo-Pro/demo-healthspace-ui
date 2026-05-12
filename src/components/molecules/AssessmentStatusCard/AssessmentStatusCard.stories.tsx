import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { AssessmentStatusCard } from './AssessmentStatusCard';

/**
 * EPIC-002-S6: AssessmentStatusCard Storybook Stories
 *
 * This story demonstrates all status variants of the AssessmentStatusCard component:
 * - Completed (green badge, "Retake" button)
 * - Pending (yellow badge, "Resume" button)
 * - Expired (red badge, "Start" button)
 *
 * The component displays assessment status with:
 * - Type-specific title (ROM/Posture/Survey)
 * - Status badge with color-coded indicator
 * - Relative date formatting ("2 days ago")
 * - Optional score display (0-100)
 * - Status-appropriate CTA button
 */
const meta: Meta<typeof AssessmentStatusCard> = {
	title: 'Molecules/AssessmentStatusCard',
	component: AssessmentStatusCard,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Assessment status card displaying current state of ROM, Posture, or Survey assessments. ' +
					'Features status-based badge colors, date formatting, and contextual CTA buttons.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['rom', 'posture', 'survey'],
			description: 'Type of assessment',
		},
		status: {
			control: 'select',
			options: ['completed', 'pending', 'expired'],
			description: 'Current assessment status',
		},
		lastUpdated: {
			control: 'text',
			description: 'ISO date string of last update',
		},
		score: {
			control: { type: 'number', min: 0, max: 100 },
			description: 'Score value (0-100) or null if not available',
		},
		onAction: {
			action: 'clicked',
			description: 'Callback when CTA button is clicked',
		},
	},
};

export default meta;
type Story = StoryObj<typeof AssessmentStatusCard>;

/**
 * Completed Status (AC-004)
 * - Green badge with checkmark icon
 * - "Retake" button
 * - Displays score
 */
export const Completed: Story = {
	args: {
		type: 'rom',
		status: 'completed',
		lastUpdated: '2025-10-18T10:00:00Z',
		score: 85,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Completed assessment showing green success badge, score, and "Retake" button. ' +
					'Date is displayed as relative time (e.g., "2 days ago").',
			},
		},
	},
};

/**
 * Pending Status (AC-004)
 * - Yellow badge with clock icon
 * - "Resume" button
 * - No score (assessment in progress)
 */
export const Pending: Story = {
	args: {
		type: 'posture',
		status: 'pending',
		lastUpdated: '2025-10-15T14:30:00Z',
		score: null,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Pending assessment showing yellow warning badge and "Resume" button. ' +
					'No score is displayed since assessment is in progress.',
			},
		},
	},
};

/**
 * Expired Status (AC-004)
 * - Red badge with exclamation icon
 * - "Start" button
 * - No score (assessment expired)
 */
export const Expired: Story = {
	args: {
		type: 'survey',
		status: 'expired',
		lastUpdated: '2025-09-01T08:00:00Z',
		score: null,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Expired assessment showing red error badge and "Start" button. ' +
					'Assessment must be restarted from the beginning.',
			},
		},
	},
};

/**
 * ROM Assessment - Completed
 * Demonstrates ROM-specific completed assessment
 */
export const ROMCompleted: Story = {
	args: {
		type: 'rom',
		status: 'completed',
		lastUpdated: '2025-10-19T16:45:00Z',
		score: 92,
	},
	parameters: {
		docs: {
			description: {
				story: 'Range of Motion assessment with high score (92/100).',
			},
		},
	},
};

/**
 * Posture Assessment - Pending
 * Demonstrates Posture-specific pending assessment
 */
export const PosturePending: Story = {
	args: {
		type: 'posture',
		status: 'pending',
		lastUpdated: '2025-10-20T09:15:00Z',
		score: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Posture analysis assessment in progress, ready to resume.',
			},
		},
	},
};

/**
 * Survey Assessment - Expired
 * Demonstrates Survey-specific expired assessment
 */
export const SurveyExpired: Story = {
	args: {
		type: 'survey',
		status: 'expired',
		lastUpdated: '2025-08-20T12:00:00Z',
		score: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Health survey that expired over a month ago.',
			},
		},
	},
};

/**
 * Perfect Score
 * Edge case: Maximum score (100/100)
 */
export const PerfectScore: Story = {
	args: {
		type: 'rom',
		status: 'completed',
		lastUpdated: '2025-10-20T11:00:00Z',
		score: 100,
	},
	parameters: {
		docs: {
			description: {
				story: 'Assessment with perfect score of 100/100.',
			},
		},
	},
};

/**
 * Zero Score
 * Edge case: Minimum score (0/100)
 */
export const ZeroScore: Story = {
	args: {
		type: 'rom',
		status: 'completed',
		lastUpdated: '2025-10-19T08:30:00Z',
		score: 0,
	},
	parameters: {
		docs: {
			description: {
				story: 'Assessment with minimum score of 0/100.',
			},
		},
	},
};

/**
 * Recent Update
 * Shows very recent timestamp (less than 1 hour ago)
 */
export const RecentUpdate: Story = {
	args: {
		type: 'posture',
		status: 'pending',
		lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
		score: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Assessment updated within the last hour (30 minutes ago).',
			},
		},
	},
};

/**
 * Old Assessment
 * Shows older timestamp (months ago)
 */
export const OldAssessment: Story = {
	args: {
		type: 'survey',
		status: 'expired',
		lastUpdated: '2025-06-15T10:00:00Z',
		score: null,
	},
	parameters: {
		docs: {
			description: {
				story: 'Assessment from several months ago.',
			},
		},
	},
};
