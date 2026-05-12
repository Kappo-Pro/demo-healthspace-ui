/**
 * SummaryTab Storybook Stories
 *
 * Visual documentation and testing for SummaryTab component
 *
 * @storybook
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SummaryTab } from './SummaryTab';
import { TDataProps } from '@types';

const meta: Meta<typeof SummaryTab> = {
	title: 'Organisms/EvaluationResultsModal/Tabs/SummaryTab',
	component: SummaryTab,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'SummaryTab displays evaluation metadata, key findings, and quick actions. This is the primary view clinicians see when opening an evaluation.',
			},
		},
	},
	argTypes: {
		exportLoading: {
			control: 'boolean',
			description: 'Shows loading spinner on export button',
			defaultValue: false,
		},
		data: {
			description: 'Evaluation data to display',
		},
		onStatusChange: {
			action: 'status-changed',
			description: 'Callback when status dropdown changes',
		},
		onExport: {
			action: 'export-clicked',
			description: 'Callback when export PDF button is clicked',
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SummaryTab>;

// ============================================================================
// MOCK DATA
// ============================================================================

const completeData: TDataProps = {
	id: 'eval-123',
	createdAt: new Date('2025-10-30'),
	updatedAt: new Date('2025-10-30'),
	active: true,
	userId: 'user-123',
	painAssessments: [
		{
			id: 'pain-1',
			painIntensity: 6,
			strapiBodyPoint: {
				id: 1,
				attributes: {
					name: 'Lower Back',
					position: 'lumbar',
				},
			},
		},
		{
			id: 'pain-2',
			painIntensity: 4,
			strapiBodyPoint: {
				id: 2,
				attributes: {
					name: 'Right Shoulder',
					position: 'shoulder',
				},
			},
		},
		{
			id: 'pain-3',
			painIntensity: 7,
			strapiBodyPoint: {
				id: 3,
				attributes: {
					name: 'Left Knee',
					position: 'knee',
				},
			},
		},
	],
	healthSigns: {
		strapiHealthSigns: [
			{
				id: 1,
				attributes: {
					name: 'Limited Range of Motion',
					description: 'Reduced flexibility in lumbar region',
				},
			},
			{
				id: 2,
				attributes: {
					name: 'Muscle Weakness',
					description: 'Decreased strength in lower extremities',
				},
			},
		],
	},
	medicalHistories: {
		strapiMedicalHistories: [
			{
				id: 1,
				attributes: {
					name: 'Chronic Back Pain',
					description: 'Long-term condition, 5+ years',
				},
			},
			{
				id: 2,
				attributes: {
					name: 'Previous Surgery',
					description: 'Lumbar fusion L4-L5 in 2020',
				},
			},
		],
	},
};

const minimalData: TDataProps = {
	id: 'eval-456',
	createdAt: new Date('2025-10-30'),
	updatedAt: new Date('2025-10-30'),
	active: false,
	userId: '',
	painAssessments: [],
	healthSigns: {
		strapiHealthSigns: [],
	},
	medicalHistories: {
		strapiMedicalHistories: [],
	},
};

const noFindingsData: TDataProps = {
	id: 'eval-789',
	createdAt: new Date('2025-10-30'),
	updatedAt: new Date('2025-10-30'),
	active: true,
	userId: 'user-456',
	painAssessments: [],
	healthSigns: {
		strapiHealthSigns: [],
	},
	medicalHistories: {
		strapiMedicalHistories: [],
	},
};

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default story with complete evaluation data and key findings
 */
export const Default: Story = {
	args: {
		data: completeData,
		exportLoading: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Complete evaluation with all metadata fields populated and multiple key findings. This represents a typical evaluation view.',
			},
		},
	},
};

/**
 * Minimal data story with missing optional fields
 */
export const MinimalData: Story = {
	args: {
		data: minimalData,
		exportLoading: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Evaluation with minimal data - only required fields populated. Provider and Duration show "N/A". Demonstrates graceful empty state handling.',
			},
		},
	},
};

/**
 * No findings story with empty key findings section
 */
export const NoFindings: Story = {
	args: {
		data: noFindingsData,
		exportLoading: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Evaluation with no key findings. Shows empty state message: "No key findings available".',
			},
		},
	},
};

/**
 * Export loading story showing export button in loading state
 */
export const ExportLoading: Story = {
	args: {
		data: completeData,
		exportLoading: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Export button in loading state. Button shows spinner and "Exporting..." text. Demonstrates async export operation feedback.',
			},
		},
	},
};

/**
 * Mobile view story showing responsive layout at 375px
 */
export const MobileView: Story = {
	args: {
		data: completeData,
		exportLoading: false,
	},
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
		docs: {
			description: {
				story:
					'Mobile view at 375px width. Layout switches to single column with stacked sections. Touch targets are optimized for mobile interaction.',
			},
		},
	},
};

/**
 * Tablet view story showing responsive layout at 768px
 */
export const TabletView: Story = {
	args: {
		data: completeData,
		exportLoading: false,
	},
	parameters: {
		viewport: {
			defaultViewport: 'tablet',
		},
		docs: {
			description: {
				story:
					'Tablet view at 768px width. Layout uses two-column grid with metadata on left and actions on right.',
			},
		},
	},
};

/**
 * Desktop view story showing responsive layout at 1024px+
 */
export const DesktopView: Story = {
	args: {
		data: completeData,
		exportLoading: false,
	},
	parameters: {
		viewport: {
			defaultViewport: 'desktop',
		},
		docs: {
			description: {
				story:
					'Desktop view at 1024px+ width. Full two-column layout with optimal spacing and wider action column.',
			},
		},
	},
};

/**
 * Long findings list story showing maximum 5 findings
 */
export const LongFindingsList: Story = {
	args: {
		data: {
			...completeData,
			painAssessments: Array(10)
				.fill(null)
				.map((_, i) => ({
					id: `pain-${i}`,
					painIntensity: 5 + (i % 5),
					strapiBodyPoint: {
						id: i,
						attributes: {
							name: `Body Part ${i + 1}`,
							position: `position-${i}`,
						},
					},
				})),
		},
		exportLoading: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Evaluation with many pain assessments. Key findings are limited to maximum 5 items to prevent overwhelming the user.',
			},
		},
	},
};

/**
 * Interactive story for testing all component interactions
 */
export const Interactive: Story = {
	args: {
		data: completeData,
		exportLoading: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Interactive story for testing status dropdown changes and export button clicks. Check the Actions panel below to see callback logs.',
			},
		},
	},
};
