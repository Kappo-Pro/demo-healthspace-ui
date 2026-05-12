/**
 * ClinicalSummaryCard.stories.tsx
 *
 * Storybook stories for Clinical Summary Card molecule
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ClinicalSummaryCard } from './ClinicalSummaryCard';
import type { ClinicalSummary } from '@types';

const meta: Meta<typeof ClinicalSummaryCard> = {
	title: 'Molecules/ClinicalSummaryCard',
	component: ClinicalSummaryCard,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Displays clinical assessment summary with top posture concerns, overall assessment, treatment plan, and expected timeline.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'radio',
			options: ['full', 'compact'],
			description: 'Display variant',
		},
	},
};

export default meta;
type Story = StoryObj<typeof ClinicalSummaryCard>;

// Mock data
const fullSummary: ClinicalSummary = {
	topConcerns: [
		{
			id: '1',
			bodyArea: 'neck',
			measurement: '15° forward tilt',
			severity: 'moderate',
			priority: 'high',
			description:
				'Forward head posture detected from scan analysis. Commonly caused by prolonged screen time and desk work.',
		},
		{
			id: '2',
			bodyArea: 'shoulders',
			measurement: '12° internal rotation',
			severity: 'mild',
			priority: 'medium',
			description:
				'Rounded shoulders with moderate internal rotation. Often associated with weak upper back muscles.',
		},
		{
			id: '3',
			bodyArea: 'lower back',
			measurement: '8° anterior pelvic tilt',
			severity: 'moderate',
			priority: 'high',
			description:
				'Excessive lower back curve (lordosis) causing potential strain and discomfort.',
		},
	],
	overallAssessment:
		'Moderate postural imbalances detected, primarily in the neck and upper back regions. These issues are common in individuals who spend prolonged time at a desk or looking at screens. Your assessment also revealed lower back curve irregularities that may contribute to discomfort during prolonged sitting or standing.',
	treatmentPlan:
		'The treatment approach focuses on strengthening neck and shoulder muscles while improving core stability. Your exercise program targets forward head posture and rounded shoulders with specific stretches and strengthening exercises. Core strengthening exercises will address the lower back curve. Consistency is key for seeing improvement.',
	progressIndicators: [
		'Improved neck mobility and reduced tension',
		'Ability to maintain shoulders back position longer',
		'Better awareness of proper sitting and standing posture',
		'Reduced lower back discomfort during daily activities',
		'Improved core strength and stability',
	],
	expectedImprovementTimeline: '4-6 weeks',
	generatedAt: '2025-10-24T10:00:00Z',
};

const mildSummary: ClinicalSummary = {
	topConcerns: [
		{
			id: '1',
			bodyArea: 'neck',
			measurement: '8° forward tilt',
			severity: 'mild',
			priority: 'medium',
			description: 'Mild forward head posture.',
		},
		{
			id: '2',
			bodyArea: 'upper back',
			measurement: '5° rounding',
			severity: 'mild',
			priority: 'low',
			description: 'Slight upper back rounding.',
		},
	],
	overallAssessment:
		'Mild postural imbalances detected. These are minor concerns that can be easily addressed with regular exercise.',
	treatmentPlan:
		'Focus on maintaining good posture habits and performing stretches daily. Your exercises are preventative in nature.',
	progressIndicators: [
		'Maintained or improved posture',
		'Continued flexibility',
	],
	expectedImprovementTimeline: '2-3 weeks',
	generatedAt: '2025-10-24T10:00:00Z',
};

const severeSummary: ClinicalSummary = {
	topConcerns: [
		{
			id: '1',
			bodyArea: 'neck',
			measurement: '22° forward tilt',
			severity: 'severe',
			priority: 'high',
			description: 'Severe forward head posture requiring immediate attention.',
		},
		{
			id: '2',
			bodyArea: 'shoulders',
			measurement: '18° internal rotation',
			severity: 'severe',
			priority: 'high',
			description:
				'Significant shoulder rounding with restricted range of motion.',
		},
		{
			id: '3',
			bodyArea: 'lower back',
			measurement: '15° anterior pelvic tilt',
			severity: 'severe',
			priority: 'high',
			description: 'Severe lower back curve causing pain and limitation.',
		},
	],
	overallAssessment:
		'Significant postural imbalances requiring comprehensive treatment. Multiple high-priority concerns detected across neck, shoulders, and lower back.',
	treatmentPlan:
		'Intensive corrective exercise program with daily practice required. May benefit from additional physical therapy consultation.',
	progressIndicators: [
		'Gradual pain reduction',
		'Increased range of motion',
		'Improved ability to maintain corrected posture',
	],
	expectedImprovementTimeline: '8-12 weeks',
	generatedAt: '2025-10-24T10:00:00Z',
};

// Stories
export const FullVariant: Story = {
	args: {
		summary: fullSummary,
		variant: 'full',
	},
};

export const CompactVariant: Story = {
	args: {
		summary: fullSummary,
		variant: 'compact',
	},
};

export const MildConcerns: Story = {
	args: {
		summary: mildSummary,
		variant: 'full',
	},
};

export const SevereConcerns: Story = {
	args: {
		summary: severeSummary,
		variant: 'full',
	},
};

export const SingleConcern: Story = {
	args: {
		summary: {
			...fullSummary,
			topConcerns: [fullSummary.topConcerns[0]],
		},
		variant: 'full',
	},
};

export const NoProgressIndicators: Story = {
	args: {
		summary: {
			...fullSummary,
			progressIndicators: [],
		},
		variant: 'full',
	},
};

export const ShortTimeline: Story = {
	args: {
		summary: {
			...mildSummary,
			expectedImprovementTimeline: '1-2 weeks',
		},
		variant: 'full',
	},
};

export const LongTimeline: Story = {
	args: {
		summary: {
			...severeSummary,
			expectedImprovementTimeline: '12-16 weeks',
		},
		variant: 'full',
	},
};
