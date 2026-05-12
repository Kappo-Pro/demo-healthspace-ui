/**
 * EducationalContentLink.stories.tsx
 *
 * Storybook stories for Educational Content Link atom
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { EducationalContentLink } from './EducationalContentLink';
import type { EducationalResource } from '@types';

const meta: Meta<typeof EducationalContentLink> = {
	title: 'Atoms/EducationalContentLink',
	component: EducationalContentLink,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Link to educational resources (articles, videos, diagrams) for clinical reasoning transparency.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'radio',
			options: ['button', 'text'],
			description: 'Display variant',
		},
		size: {
			control: 'radio',
			options: ['small', 'middle', 'large'],
			description: 'Button size (button variant only)',
		},
		onClick: { action: 'clicked' },
	},
};

export default meta;
type Story = StoryObj<typeof EducationalContentLink>;

// Mock resources
const articleResource: EducationalResource = {
	id: '1',
	title: 'Understanding Forward Head Posture',
	url: '/resources/forward-head-posture',
	type: 'article',
	source: 'strapi',
	description:
		'Learn about the causes of forward head posture and evidence-based treatment approaches.',
};

const videoResource: EducationalResource = {
	id: '2',
	title: 'Posture Correction Exercises',
	url: 'https://example.com/posture-video',
	type: 'video',
	source: 'external',
	description:
		'Watch a comprehensive video guide to exercises that improve posture.',
	duration: 180, // 3 minutes
};

const diagramResource: EducationalResource = {
	id: '3',
	title: 'Neck Anatomy Diagram',
	url: '/diagrams/neck-anatomy',
	type: 'diagram',
	source: 'strapi',
	description: 'Interactive diagram showing neck muscles and vertebrae.',
};

// Stories
export const ArticleButton: Story = {
	args: {
		resource: articleResource,
		variant: 'button',
		size: 'small',
	},
};

export const VideoButton: Story = {
	args: {
		resource: videoResource,
		variant: 'button',
		size: 'small',
	},
};

export const DiagramButton: Story = {
	args: {
		resource: diagramResource,
		variant: 'button',
		size: 'small',
	},
};

export const ArticleTextLink: Story = {
	args: {
		resource: articleResource,
		variant: 'text',
	},
};

export const VideoTextLink: Story = {
	args: {
		resource: videoResource,
		variant: 'text',
	},
};

export const DiagramTextLink: Story = {
	args: {
		resource: diagramResource,
		variant: 'text',
	},
};

export const LargeButton: Story = {
	args: {
		resource: articleResource,
		variant: 'button',
		size: 'large',
	},
};

export const WithoutDescription: Story = {
	args: {
		resource: {
			...articleResource,
			description: undefined,
		},
		variant: 'button',
		size: 'small',
	},
};

export const ExternalLink: Story = {
	args: {
		resource: {
			id: '4',
			title: 'External Research Paper',
			url: 'https://example.com/research',
			type: 'article',
			source: 'external',
			description: 'Published research on posture correction',
		},
		variant: 'text',
	},
};
