/**
 * ProgressMilestone Storybook Stories
 *
 * Demonstrates all variants and states of the ProgressMilestone component.
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ProgressMilestone } from './ProgressMilestone';
import type { PatientMilestone } from '@types/posture';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof ProgressMilestone> = {
	title: 'Atoms/ProgressMilestone',
	component: ProgressMilestone,
	tags: ['autodocs'],
	argTypes: {
		milestone: {
			control: 'object',
			description: 'Milestone data object',
		},
		showMetricImprovement: {
			control: 'boolean',
			description: 'Show metric improvement details',
		},
		compact: {
			control: 'boolean',
			description: 'Compact mode with reduced spacing',
		},
		className: {
			control: 'text',
			description: 'Additional CSS class',
		},
	},
	parameters: {
		docs: {
			description: {
				component: `
A milestone marker component for displaying patient journey progress.

### Features
- **Achievement Status**: Visual indicators for achieved/pending milestones
- **Type Icons**: Specific icons for assessment, improvement, goal, treatment
- **Metric Improvement**: Optional display of before/after values with percentage change
- **Date Display**: Formatted achievement dates
- **Compact Mode**: Reduced spacing for dense layouts
- **Accessible**: ARIA labels and semantic HTML

### Milestone Types
- **Assessment**: Initial evaluations and check-ins
- **Improvement**: Significant metric improvements
- **Goal**: Achievement of treatment goals
- **Treatment**: Treatment plan milestones

### Usage
\`\`\`tsx
<ProgressMilestone
  milestone={{
    id: '1',
    title: 'First Assessment',
    achievedAt: '2025-01-15',
    type: 'assessment'
  }}
/>
\`\`\`
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof ProgressMilestone>;

// Sample milestone data
const achievedAssessment: PatientMilestone = {
	id: '1',
	title: 'First Assessment Completed',
	description: 'Baseline posture evaluation completed successfully',
	achievedAt: '2025-01-15T10:00:00Z',
	type: 'assessment',
};

const achievedImprovement: PatientMilestone = {
	id: '2',
	title: '10% Improvement Milestone',
	description: 'Significant improvement in shoulder symmetry detected',
	achievedAt: '2025-02-01T14:30:00Z',
	type: 'improvement',
	metricImprovement: {
		metric: 'Shoulder Symmetry',
		before: 65,
		after: 82,
	},
};

const achievedGoal: PatientMilestone = {
	id: '3',
	title: 'Primary Treatment Goal Achieved',
	description: 'Reached target posture score of 80/100',
	achievedAt: '2025-03-10T09:15:00Z',
	type: 'goal',
	metricImprovement: {
		metric: 'Overall Score',
		before: 72,
		after: 84,
	},
};

const pendingTreatment: PatientMilestone = {
	id: '4',
	title: '6-Week Treatment Review',
	description: 'Scheduled comprehensive posture reassessment',
	achievedAt: null,
	type: 'treatment',
};

// ============================================================================
// STORIES - Achievement Status
// ============================================================================

/**
 * Achieved milestone with date
 */
export const Achieved: Story = {
	args: {
		milestone: achievedAssessment,
		showMetricImprovement: true,
		compact: false,
	},
};

/**
 * Pending milestone (not yet achieved)
 */
export const Pending: Story = {
	args: {
		milestone: pendingTreatment,
		showMetricImprovement: true,
		compact: false,
	},
};

// ============================================================================
// STORIES - Milestone Types
// ============================================================================

/**
 * Assessment type milestone
 */
export const AssessmentType: Story = {
	args: {
		milestone: achievedAssessment,
		showMetricImprovement: true,
	},
};

/**
 * Improvement type milestone with metrics
 */
export const ImprovementType: Story = {
	args: {
		milestone: achievedImprovement,
		showMetricImprovement: true,
	},
};

/**
 * Goal type milestone
 */
export const GoalType: Story = {
	args: {
		milestone: achievedGoal,
		showMetricImprovement: true,
	},
};

/**
 * Treatment type milestone
 */
export const TreatmentType: Story = {
	args: {
		milestone: pendingTreatment,
		showMetricImprovement: true,
	},
};

// ============================================================================
// STORIES - Metric Improvement
// ============================================================================

/**
 * With metric improvement display
 */
export const WithMetricImprovement: Story = {
	args: {
		milestone: achievedImprovement,
		showMetricImprovement: true,
	},
};

/**
 * Without metric improvement display
 */
export const WithoutMetricImprovement: Story = {
	args: {
		milestone: achievedImprovement,
		showMetricImprovement: false,
	},
};

// ============================================================================
// STORIES - Size Variants
// ============================================================================

/**
 * Default size
 */
export const DefaultSize: Story = {
	args: {
		milestone: achievedAssessment,
		compact: false,
	},
};

/**
 * Compact mode (reduced spacing)
 */
export const CompactMode: Story = {
	args: {
		milestone: achievedAssessment,
		compact: true,
	},
};

// ============================================================================
// STORIES - Composite Examples
// ============================================================================

/**
 * Timeline view with multiple milestones
 */
export const TimelineView: Story = {
	render: () => (
		<div role="list" style={{ maxWidth: '600px' }}>
			<ProgressMilestone milestone={achievedAssessment} />
			<ProgressMilestone milestone={achievedImprovement} />
			<ProgressMilestone milestone={achievedGoal} />
			<ProgressMilestone milestone={pendingTreatment} />
		</div>
	),
};

/**
 * Compact timeline for sidebar
 */
export const CompactTimeline: Story = {
	render: () => (
		<div role="list" style={{ maxWidth: '400px' }}>
			<ProgressMilestone milestone={achievedAssessment} compact />
			<ProgressMilestone milestone={achievedImprovement} compact />
			<ProgressMilestone milestone={achievedGoal} compact />
			<ProgressMilestone milestone={pendingTreatment} compact />
		</div>
	),
};

/**
 * Achievement showcase (metrics visible)
 */
export const AchievementShowcase: Story = {
	render: () => (
		<div
			style={{
				border: '1px solid var(--border-primary, #e0e0e0)',
				borderRadius: '12px',
				padding: 'var(--spacing-6)',
				maxWidth: '500px',
				background: 'var(--surface-primary, #fff)',
			}}>
			<h3 style={{ margin: '0 0 20px 0', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
				Recent Achievements
			</h3>
			<div role="list">
				<ProgressMilestone
					milestone={achievedImprovement}
					showMetricImprovement={true}
				/>
				<ProgressMilestone
					milestone={achievedGoal}
					showMetricImprovement={true}
				/>
			</div>
		</div>
	),
};

/**
 * Journey progress card
 */
export const JourneyProgressCard: Story = {
	render: () => (
		<div
			style={{
				border: '1px solid var(--border-primary, #e0e0e0)',
				borderRadius: '12px',
				padding: 'var(--spacing-5)',
				maxWidth: '600px',
				background: 'var(--surface-primary, #fff)',
			}}>
			<div style={{ marginBottom: 'var(--spacing-5)' }}>
				<h3
					style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
					Patient Journey
				</h3>
				<p
					style={{
						margin: 0,
						color: 'var(--text-secondary, #666)',
						fontSize: 'var(--font-size-sm)',
					}}>
					4 milestones • 3 achieved • 1 pending
				</p>
			</div>
			<div role="list">
				<ProgressMilestone milestone={achievedAssessment} />
				<ProgressMilestone milestone={achievedImprovement} />
				<ProgressMilestone milestone={achievedGoal} />
				<ProgressMilestone milestone={pendingTreatment} />
			</div>
		</div>
	),
};

/**
 * Loading state (skeleton)
 */
export const LoadingState: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-3)', padding: '12px 0' }}>
			<div
				style={{
					width: 'var(--spacing-6)',
					height: 'var(--spacing-6)',
					borderRadius: '50%',
					background:
						'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
					backgroundSize: '200% 100%',
				}}
			/>
			<div style={{ flex: 1 }}>
				<div
					style={{
						height: 'var(--spacing-5)',
						width: '70%',
						background:
							'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
						backgroundSize: '200% 100%',
						borderRadius: '4px',
						marginBottom: 'var(--spacing-2)',
					}}
				/>
				<div
					style={{
						height: 'var(--spacing-4)',
						width: '90%',
						background:
							'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
						backgroundSize: '200% 100%',
						borderRadius: '4px',
					}}
				/>
			</div>
		</div>
	),
};

/**
 * Empty state (no milestones)
 */
export const EmptyState: Story = {
	render: () => (
		<div
			style={{
				padding: '40px 20px',
				textAlign: 'center',
				color: 'var(--text-tertiary, #999)',
				border: '2px dashed var(--border-secondary, #e0e0e0)',
				borderRadius: '8px',
			}}>
			<p style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
				No milestones yet
			</p>
			<p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
				Complete your first assessment to start tracking progress
			</p>
		</div>
	),
};
