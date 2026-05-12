/**
 * ClinicalReasoningPanel.stories.tsx
 *
 * Storybook stories for Clinical Reasoning Panel molecule
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ClinicalReasoningPanel } from './ClinicalReasoningPanel';
import type { ClinicalReasoning } from '@types';

const meta: Meta<typeof ClinicalReasoningPanel> = {
	title: 'Molecules/ClinicalReasoningPanel',
	component: ClinicalReasoningPanel,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Displays clinical reasoning for exercise recommendations with plain language explanations, posture findings, benefits, and educational resources.',
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ClinicalReasoningPanel>;

// Mock data
const neckExerciseReasoning: ClinicalReasoning = {
	exerciseId: '1',
	explanation:
		'Your posture scan showed that your head is positioned 15 degrees forward of your shoulders. This "forward head posture" puts extra strain on your neck muscles. Chin tucks help by strengthening the muscles that support your neck and retraining your head to sit in a more balanced position over your shoulders.',
	postureFindings: [
		{
			id: '1',
			bodyArea: 'neck',
			measurement: '15° forward tilt',
			severity: 'moderate',
			priority: 'high',
			description:
				'Forward head posture detected from scan analysis. This is common in individuals who spend prolonged time looking at screens.',
		},
		{
			id: '2',
			bodyArea: 'shoulders',
			measurement: '12° internal rotation',
			severity: 'mild',
			priority: 'medium',
			description:
				'Rounded shoulders (often caused by desk work and poor posture habits).',
		},
	],
	expectedOutcome: 'Reduced neck tension and improved head positioning',
	timeline: '2-3 weeks',
	evidenceLinks: [
		{
			id: '1',
			title: 'Understanding Forward Head Posture',
			url: '/resources/forward-head-posture',
			type: 'article',
			source: 'strapi',
			description: 'Learn about causes and treatment approaches',
		},
		{
			id: '2',
			title: 'Neck Strengthening Exercises',
			url: '/resources/neck-exercises-video',
			type: 'video',
			source: 'strapi',
			description: 'Video guide to effective neck exercises',
			duration: 240,
		},
		{
			id: '3',
			title: 'Neck Anatomy Diagram',
			url: '/diagrams/neck-anatomy',
			type: 'diagram',
			source: 'strapi',
		},
	],
	benefits: [
		'Strengthens the deep neck flexor muscles that support proper head position',
		'Reduces tension in the upper trapezius and levator scapulae muscles',
		'Improves awareness of proper posture throughout the day',
		'Helps prevent headaches associated with forward head posture',
	],
	readabilityScore: 78.5,
	avgSentenceLength: 15.2,
};

const lowerBackReasoning: ClinicalReasoning = {
	exerciseId: '2',
	explanation:
		'Your scan revealed an 8-degree anterior pelvic tilt, which causes excessive lower back curve. This core strengthening exercise helps by building the abdominal and lower back muscles. A strong core provides essential support for your spine, reducing strain on your lower back.',
	postureFindings: [
		{
			id: '3',
			bodyArea: 'lower back',
			measurement: '8° anterior pelvic tilt',
			severity: 'moderate',
			priority: 'high',
			description:
				'Excessive lower back curve (lordosis) causing strain and potential discomfort.',
		},
	],
	expectedOutcome:
		'Reduced lower back discomfort and improved spinal alignment',
	timeline: '3-4 weeks',
	evidenceLinks: [
		{
			id: '4',
			title: 'Core Strength and Back Health',
			url: '/resources/core-strength',
			type: 'article',
			source: 'strapi',
			description: 'How core exercises protect your spine',
		},
	],
	benefits: [
		'Strengthens core muscles that support your spine',
		'Reduces lower back strain and discomfort',
		'Improves pelvic alignment and posture',
	],
	readabilityScore: 72.3,
	avgSentenceLength: 16.8,
};

const minimalReasoning: ClinicalReasoning = {
	exerciseId: '3',
	explanation:
		'This exercise targets key muscle groups that support better posture. Regular practice helps strengthen weak areas.',
	postureFindings: [
		{
			id: '4',
			bodyArea: 'upper back',
			measurement: 'Moderate imbalance detected',
			severity: 'mild',
			priority: 'low',
			description: 'General postural imbalance in upper back region.',
		},
	],
	expectedOutcome: 'Improved overall posture',
	timeline: '2-4 weeks',
	evidenceLinks: [],
	benefits: ['Strengthens supporting muscle groups', 'Improves body alignment'],
	readabilityScore: 82.1,
};

// Stories
export const FullDetails: Story = {
	args: {
		reasoning: neckExerciseReasoning,
	},
};

export const LowerBackExercise: Story = {
	args: {
		reasoning: lowerBackReasoning,
	},
};

export const MinimalDetails: Story = {
	args: {
		reasoning: minimalReasoning,
	},
};

export const HighPriority: Story = {
	args: {
		reasoning: {
			...neckExerciseReasoning,
			postureFindings: neckExerciseReasoning.postureFindings.map(f => ({
				...f,
				priority: 'high' as const,
			})),
		},
	},
};

export const LowPriority: Story = {
	args: {
		reasoning: {
			...minimalReasoning,
			postureFindings: minimalReasoning.postureFindings.map(f => ({
				...f,
				priority: 'low' as const,
			})),
		},
	},
};

export const SevereConcerns: Story = {
	args: {
		reasoning: {
			...neckExerciseReasoning,
			postureFindings: neckExerciseReasoning.postureFindings.map(f => ({
				...f,
				severity: 'severe' as const,
				priority: 'high' as const,
			})),
		},
	},
};

export const NoEducationalResources: Story = {
	args: {
		reasoning: {
			...neckExerciseReasoning,
			evidenceLinks: [],
		},
	},
};

export const NoBenefits: Story = {
	args: {
		reasoning: {
			...neckExerciseReasoning,
			benefits: [],
		},
	},
};

export const NoPostureFindings: Story = {
	args: {
		reasoning: {
			...neckExerciseReasoning,
			postureFindings: [],
		},
	},
};
